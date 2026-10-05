import fs from 'node:fs';
import {extractShots,features} from '../lib/shl.ts';
const dir='/tmp/isbild-data';const schedules=JSON.parse(fs.readFileSync(dir+'/training-schedule.json','utf8'));const rows=[];
for(const [index,g] of schedules.entries()){const file=`${dir}/${g.uuid}.json`;if(!fs.existsSync(file))continue;const shots=extractShots(JSON.parse(fs.readFileSync(file,'utf8')).filter(e=>!['shot','goal'].includes(e.type)||(typeof e.locationX==='number'&&typeof e.locationY==='number'&&e.locationX>=-60&&e.locationX<=650&&Math.abs(e.locationY)<=170)));for(const s of shots){if(s.eligible&&s.outcome!=='blocked')rows.push({game:g.uuid,date:g.startDateTime,split:index<Math.floor(schedules.length*.8)?'train':'test',features:features(s),goal:s.outcome==='goal'?1:0});}}
fs.writeFileSync('/tmp/isbild-training.json',JSON.stringify(rows));console.log('Prepared',rows.length,'shots');
