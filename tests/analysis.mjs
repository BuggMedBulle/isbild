import assert from 'node:assert/strict';import fs from 'node:fs';import {teamGames,aggregate,previousWindow,ranking,barWidths,headline,performance} from '../lib/analysis.ts';
const snapshot=JSON.parse(fs.readFileSync(new URL('../data/shl-2026.json',import.meta.url)));const team='Djurgårdens IF';const rows=teamGames(snapshot.games.filter(g=>g.date<='2026-10-03'),team,'all','all');const s=aggregate(rows,team,'all');assert.equal(rows.length,6);assert.equal(s.gf,8);assert.equal(s.ga,16);assert(Math.abs(s.xgf-rows.flatMap(g=>g.shots.filter(x=>x.home===(g.home===team))).reduce((a,x)=>a+x.xg,0))<1e-9);assert(headline(s).includes('svagare'));const last=teamGames(snapshot.games.filter(g=>g.date<='2026-10-03'),team,'5','all');assert.equal(last.length,5);const prev=previousWindow(snapshot.games.filter(g=>g.date<='2026-10-03'),team,'5','all');assert.equal(prev.length,1);assert(last.every(g=>!prev.some(p=>p.id===g.id)));assert.equal(ranking([{team:'A',value:50},{team:'B',value:50},{team:'C',value:40}], 'B'),1);assert.equal(ranking([{team:'A',value:null}], 'A'),null);assert(Math.abs(barWidths(4,2)[0]-100*4/6)<1e-10);assert(Math.abs(barWidths(4,2)[1]-100*2/6)<1e-10);assert.deepEqual(barWidths(0,0),[50,50]);const assets=JSON.parse(fs.readFileSync(new URL('../data/club-assets.json',import.meta.url)));assert.equal(assets.length,14);for(const a of assets){const svg=fs.readFileSync(new URL('../public'+a.file,import.meta.url),'utf8');assert(svg.includes('<svg'));assert(!/<script|<foreignObject|onload=/i.test(svg));}const published=JSON.parse(fs.readFileSync(new URL('../public/data/shl-2026.json',import.meta.url)));assert.deepEqual(published,snapshot);console.log('PASS: actual DIF statistics, non-overlapping windows, tied ranks, proportional bars, 14 original emblems, identical public snapshot.');

const vx=snapshot.games.find(g=>g.id==='shl-hmglqamkzf');assert.equal(vx.resultHome,4);assert.equal(vx.resultAway,3);assert.deepEqual(vx.goals.filter(g=>!g.included).map(g=>[g.player,g.seconds,g.reason]),[['Olivier Nadeau',3533,'Uttagen målvakt'],['Charles Hudon',3687,'Förlängning']]);console.log('PASS: DIF–VLH score discrepancy explained from official goal events.');

// Distinguish chance creation, finishing and verified keeper outcomes, including offsetting effects.
const sample=(gf,ga,xgf,xga,n=6)=>({gf,ga,xgf,xga,n,share:50,goalShare:50,corsi:null});
const boosted=performance(sample(15,7,15,15),{gsax:8,complete:true});assert(boosted.title.includes('Målvakter'));assert.equal(boosted.offense.title,'Utdelning nära xG');assert.equal(boosted.verifiedGoalies,true);assert(boosted.defense.text.includes('samma observation'));
assert(performance(sample(22,7,22,15),{gsax:8,complete:true}).title.includes('Chansövertag förstärks'));
assert(performance(sample(18,7,18,15),{gsax:4,complete:true}).verifiedGoalies===false);
assert(performance(sample(18,7,18,15),{gsax:8,complete:false}).verifiedGoalies===false);
assert(performance(sample(18,7,18,15)).defense.text.includes('saknas'));
const offset=performance(sample(10,10,18,18),{gsax:8,complete:true});assert(offset.title.includes('Svag offensiv'));assert.equal(offset.offense.value,-8);assert.equal(offset.defense.value,8);
assert(performance(sample(24,22,18,15),{gsax:-7,complete:true}).title.includes('Stark offensiv'));
assert(performance(sample(8,18,18,12),{gsax:-6,complete:true}).title.includes('Svag utdelning både'));
assert(performance(sample(18,17,18,18,1),{gsax:1,complete:true}).note.includes('Litet urval'));
assert(performance(sample(18,17,18,18,20),{gsax:1,complete:true}).title.includes('jämn'));
assert.equal(performance(sample(0,0,0,0,0)).title,'Analysunderlag saknas');
const fbk=teamGames(snapshot.games,'Färjestad BK','all','all');const fbkStats=aggregate(fbk,'Färjestad BK','all');console.log('Färjestad analysis:',performance(fbkStats,{gsax:fbkStats.xga-fbkStats.ga,complete:true}).title);console.log('PASS: nuanced team assessments, offsetting offense/defense, matched goalkeeper coverage, missing data and small samples.');

// Weighted shooting efficiency; missing or zero shots must not become 0%.
const {sumStats}=await import('../lib/hockey.ts');
const {playerMatchStats}=await import('../lib/player-match.ts');
const stat=(gf,sog)=>({gf,ga:0,xgf:1,xga:1,sog});
assert.equal(sumStats([stat(1,2),stat(1,18)]).shooting,10);
assert.equal(sumStats([stat(0,0)]).shooting,null);
assert.equal(sumStats([stat(1,10),stat(0,undefined)]).shooting,null);
assert.equal(sumStats([]).shooting,null);
const shot=(outcome,xg,extra={})=>({player:'Test',home:true,eligible:true,emptyNet:false,period:1,outcome,xg,...extra});
const pr=playerMatchStats({home:'A',away:'B',shots:[shot('goal',.2),shot('saved',.1),shot('missed',.1),shot('blocked',0),shot('goal',.8,{period:4}),shot('goal',.8,{emptyNet:true}),shot('saved',.1,{eligible:false}),shot('blocked',0,{home:false}),shot('goal',.1,{player:'Okänd spelare'})]});
assert.equal(pr.length,2);assert.deepEqual(pr[0],{name:'Test',team:'A',goals:1,sog:2,attempts:4,xg:.4,shooting:50});assert.equal(pr[1].shooting,null);
console.log('PASS: weighted shooting efficiency, missing and zero shots, individual xG, team identity and match exclusions.');
