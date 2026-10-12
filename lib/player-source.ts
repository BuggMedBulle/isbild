import type {ShlScheduleGame} from './shl';

export type OfficialPlayer={id:string;name:string;home:boolean;position:'F'|'D';seconds:number|null;blocks:number|null};
export type OfficialPlayers={version:1;scope:'official-all-situations';players:OfficialPlayer[];sourceUrl:string;fetchedAt:string;error?:string};
export const playerSourceUrl=(id:string)=>`https://www.shl.se/api/gameday/player-stats/${id}`;
const count=(v:unknown)=>typeof v==='number'&&Number.isInteger(v)&&v>=0?v:null;
export function timeSeconds(value:unknown):number|null {
 if(typeof value!=='string'||!/^\d{1,3}:\d{2}$/.test(value))return null;
 const [m,s]=value.split(':').map(Number);return s<60?m*60+s:null;
}
export function formatIceTime(seconds:number|null){return seconds===null?'—':`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}

/** Official TOI includes OT and empty-net play. It must not normalize the beta's different scope. */
export function parseOfficialPlayers(value:unknown,game:ShlScheduleGame):OfficialPlayers {
 const p=value as any,players:OfficialPlayer[]=[];
 if(p?.provider!=='statnet'||!p.stats||!p.players)throw Error('Okänt format för officiell spelarstatistik');
 for(const home of [true,false]){
  const side=home?'homeTeamValue':'awayTeamValue',rows=p.stats[side],names=p.players[side];
  if(!Array.isArray(rows)||rows.length<10||!names)throw Error('Lagets spelaruppgifter saknas');
  const seen=new Set<string>();let goals=0;
  for(const row of rows){
   const id=String(row.info?.playerId??''),name=names[id]?.fullName?.trim();
   if(!/^\d+$/.test(id)||seen.has(id)||!name||row.info?.period!==0||row.info?.team!==(home?'home':'away'))throw Error('Ogiltig spelaridentitet eller matchperiod');
   seen.add(id);if(count(row.G)===null)throw Error('Spelarens mål saknas');goals+=row.G;
   const position=['LD','RD','D'].includes(row.POS)?'D':['LW','RW','CE','C','F'].includes(row.POS)?'F':null;
   if(!position)throw Error('Spelarposition saknas');
   const rawSeconds=timeSeconds(row.TOI),seconds=rawSeconds!==null&&rawSeconds<=(game.overtime||game.shootout?3900:3600)?rawSeconds:null;
   players.push({id,name,home,position,seconds,blocks:count(row.BkS)});
  }
  const result=home?game.homeTeamInfo.score:game.awayTeamInfo.score;
  const winner=home?game.homeTeamInfo.score>game.awayTeamInfo.score:game.awayTeamInfo.score>game.homeTeamInfo.score;
  if(goals!==result-(game.shootout&&winner?1:0))throw Error('Officiella spelarmål stämmer inte med matchresultatet');
 }
 return {version:1,scope:'official-all-situations',players,sourceUrl:playerSourceUrl(game.uuid),fetchedAt:new Date().toISOString()};
}
