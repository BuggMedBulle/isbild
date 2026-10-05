import fs from 'node:fs/promises';
import {parseSpecialTeams,specialUrl,validateLeague} from '../lib/special-teams.ts';
const root=new URL('../',import.meta.url);
const snapshot=JSON.parse(await fs.readFile(new URL('data/shl-2026.json',root),'utf8'));
async function get(url){let last;for(let i=0;i<3;i++){try{const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Isbild/1.0 public SHL fan analytics'},signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(`SHL HTTP ${r.status}`);return await r.json();}catch(e){last=e;}}throw last;}
const windows={};
for(const range of ['all'])for(const venue of ['all']){
 const sources=[specialUrl('pp',range,venue),specialUrl('pk',range,venue)];
 const [pp,pk]=await Promise.all(sources.map(get));
 const rows=parseSpecialTeams(pp,pk,snapshot.games,range,venue);
 if(range==='all'&&venue==='all')validateLeague(rows);
 windows[`${range}/${venue}`]={rows,sources};console.log(`Validated PP/BP ${range}/${venue}`);
}
// Replace both snapshots only after every window passes validation.
const data={season:snapshot.season,updatedAt:new Date().toISOString(),through:snapshot.games.map(g=>g.date).sort().at(-1),windows};
const text=JSON.stringify(data)+'\n';await fs.writeFile(new URL('data/special-teams.json',root),text);await fs.writeFile(new URL('public/data/special-teams.json',root),text);
