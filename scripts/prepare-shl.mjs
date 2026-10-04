import fs from 'node:fs';import {convertGame} from '../lib/shl.ts';
const model=JSON.parse(fs.readFileSync('data/xg-model.json','utf8'));const schedule=JSON.parse(fs.readFileSync('/tmp/isbild-data/current-schedule.json','utf8'));const games=[],failed=[];
for(const g of schedule){try{games.push(convertGame(g,JSON.parse(fs.readFileSync(`/tmp/isbild-data/${g.uuid}.json`,'utf8')),model));}catch(e){failed.push({id:g.uuid,error:String(e)});}}
if(failed.length)throw Error(JSON.stringify(failed));
fs.writeFileSync('data/shl-2026.json',JSON.stringify({updatedAt:new Date().toISOString(),season:'2026/27',games}));console.log('Prepared',games.length,'verified games; source snapshot bytes',fs.statSync('data/shl-2026.json').size);
