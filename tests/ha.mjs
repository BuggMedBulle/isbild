import assert from 'node:assert/strict';
import fs from 'node:fs';
import {HA_TEAMS,haName,haStandings,haMatchEvents} from '../lib/ha.ts';
const data=JSON.parse(fs.readFileSync(new URL('../data/ha-2026.json',import.meta.url),'utf8'));
assert.equal(HA_TEAMS.length,14);assert.equal(haName('MoDo'),'MoDo Hockey');assert.equal(haName('MORA'),haName('MIK'));assert.throws(()=>haName('DIF'));
const base={id:'ha-test',date:'2026-09-18',home:'AIK',away:'Mora IK',resultHome:3,resultAway:2,decided:'FT',homeShots:30,awayShots:25,url:'https://hockeyallsvenskan.se'};
let table=haStandings([base]);assert.equal(table.find(r=>r.team==='AIK').points,3);assert.equal(table.find(r=>r.team==='Mora IK').points,0);
table=haStandings([{...base,decided:'OT'}]);assert.equal(table.find(r=>r.team==='AIK').points,2);assert.equal(table.find(r=>r.team==='Mora IK').points,1);
table=haStandings([{...base,decided:'SO'}]);assert.equal(table.reduce((sum,r)=>sum+r.points,0),3);
const keeper=(code,name,isEntering=true)=>({type:'GoalkeeperEvent',time:'0',isEntering,team:{statNetId:code},player:{firstName:name,familyName:'Keeper'}});
const shot=(type,code,time,name='Shooter',extra={})=>({type,time:String(time),team:{statNetId:code},player:{firstName:name,familyName:'Player'},...extra});
const events={game_info:{game_finished:true},game_events:[{Period:'1',Events:[keeper('AIK','Home'),keeper('MIK','Away'),shot('Shot','AIK',10,'Shooter',{eventDescription:'save'}),shot('Goal','AIK',20,'Scorer',{Assist1:{name:'Assist Player'},isPenaltyShot:'false'}),keeper('MIK','Replacement'),shot('Shot','AIK',30,'Shooter',{eventDescription:'save'}),keeper('AIK','Home',false),shot('Goal','MIK',40)]},{Period:'4',Events:[shot('Goal','AIK',10)]}]};
let result=haMatchEvents(events,'AIK','MIK');assert.equal(result.goalies.length,2);const first=result.goalies.find(r=>r.name==='Away Keeper');assert.equal(first.saves,1);assert.equal(first.goals,1);assert.equal(first.savePercentage,50);assert.equal(result.players.find(r=>r.name==='Assist Player').firstAssists,1);assert.equal(result.players.reduce((n,r)=>n+r.goals,0),1);assert.equal(result.players.reduce((n,r)=>n+r.attempts,0),3);assert.equal(result.goalies.find(r=>r.name==='Replacement Keeper').savePercentage,100);assert.ok(result.goalies.every(r=>!('gsax' in r)));
result=haMatchEvents({game_info:{game_finished:true},game_events:[{Period:'1',Events:[shot('Shot','AIK',1,'Shooter',{eventDescription:'save'})]}]},'AIK','MIK');assert.equal(result.goalies.length,0);assert.match(result.eventCoverage,/saknas/);assert.throws(()=>haMatchEvents({game_info:{game_finished:false},game_events:[]},'AIK','MIK'));
assert.equal(data.league,'ha');assert.deepEqual(data.coverage,{coordinates:false,xg:false,gsax:false});assert.equal(new Set(data.games.map(g=>g.id)).size,data.games.length);assert.ok(data.games.every(g=>HA_TEAMS.includes(g.home)&&HA_TEAMS.includes(g.away)&&g.id.startsWith('ha-')&&!('xg' in g)));
for(const r of data.teams)assert.equal(r.games,data.games.filter(g=>g.home===r.team||g.away===r.team).length);
assert.equal(haStandings(data.games).reduce((n,r)=>n+r.points,0),data.games.length*3);
for(const g of data.games)for(const r of g.goalies||[]){assert.ok(r.team===g.home||r.team===g.away);assert.equal(r.savePercentage,r.saves+r.goals?r.saves/(r.saves+r.goals)*100:null);}
console.log('Hockeyallsvenskan: league separation, standings, keeper substitutions, empty net/OT exclusion, missing data and snapshot coverage passed.');
