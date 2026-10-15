import {teams,perspective,type Game} from './hockey.ts';
import {aggregate,teamGames} from './analysis.ts';
import {goalieStats} from './goalies.ts';
import {nameByCode,SHL_SEASON} from './shl.ts';
import {efficiency,type SpecialTeamsSnapshot} from './special-teams.ts';

export type Fixture={id:string;home:string;away:string;date:string;time:string;startAt:string;venue:string|null;season:string;state:'scheduled'|'live'|'finished'};
export type Schedule={version:1;season:string;updatedAt:string;source:string;games:Fixture[]};
export function stockholmDay(now:Date){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function parseSchedule(raw:unknown):Schedule {
 const input=(raw as {gameInfo?:any[]})?.gameInfo;if(!Array.isArray(input)||input.length<300||input.length>1000)throw Error('Spelschemat är ofullständigt');
 const seen=new Set<string>();
 const games:Fixture[]=input.map(g=>{
  const home=nameByCode[g.homeTeamInfo?.code],away=nameByCode[g.awayTeamInfo?.code],start=new Date(g.rawStartDateTime);
  if(!g.uuid||seen.has(g.uuid)||!teams.includes(home)||!teams.includes(away)||home===away||!Number.isFinite(start.getTime())||!/(Z|[+-]\d{2}:\d{2})$/.test(g.rawStartDateTime))throw Error('Ogiltig match i spelschemat');
  seen.add(g.uuid);const date=stockholmDay(start),time=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(start);
  if(g.startDateTime?.slice(0,10)!==date||g.startDateTime?.slice(11,16)!==time)throw Error('Matchens tidszon kunde inte verifieras');
  const state=g.state==='post-game'?'finished':g.state==='pre-game'?'scheduled':['in-game','live-game','live'].includes(g.state)?'live':null;
  if(!state)throw Error('Okänd matchstatus i spelschemat');
  return {id:'shl-'+g.uuid,home,away,date,time,startAt:start.toISOString(),season:SHL_SEASON,venue:typeof g.venueInfo?.name==='string'?g.venueInfo.name:null,state};
 });
 return {version:1,season:SHL_SEASON,source:'SHL:s publika spelschema',updatedAt:new Date().toISOString(),games:games.sort((a,b)=>a.startAt.localeCompare(b.startAt)||a.id.localeCompare(b.id))};
}
export function defaultPreviewDay(schedule:Schedule,now=new Date()){
 const today=stockholmDay(now);return schedule.games.find(g=>g.date>=today&&g.state!=='finished')?.date??null;
}
export function nextTeamFixture(schedule:Schedule,team:string,now=new Date()){
 return schedule.games.find(g=>g.date>=stockholmDay(now)&&g.state!=='finished'&&(g.home===team||g.away===team))??null;
}
const f=(v:number)=>v.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2});
export function buildMatchPreview(games:Game[],fixture:Fixture,range='all',special?:SpecialTeamsSnapshot){
 // Date-level cutoff intentionally excludes every game on the preview date, including late snapshots.
 const history=games.filter(g=>g.season===fixture.season&&g.date<fixture.date);
 const withStats=history.filter(g=>g.stats.all);const leagueMean=withStats.length?withStats.reduce((n,g)=>n+g.stats.all!.xgf+g.stats.all!.xga,0)/(2*withStats.length):null;
 function profile(team:string){
  const selected=teamGames(history,team,range,'all').filter(g=>!!perspective(g,team,'all')),s=aggregate(selected,team,'all'),last=selected.at(-1)?.date??null;
  const keeper=goalieStats(selected,'all','all',team),xga=keeper.rows.reduce((n,r)=>n+r.xga,0),ga=keeper.rows.reduce((n,r)=>n+r.goals,0);
  const verified=s.n>0&&selected.every(g=>!!g.shots?.length)&&keeper.missing===0&&keeper.total>0&&Math.abs(xga-s.xga)<.001&&ga===s.ga;
  const shots=keeper.rows.reduce((n,r)=>n+r.shots,0),saves=keeper.rows.reduce((n,r)=>n+r.saves,0);
  const lastFive=teamGames(history,team,'5','all').filter(g=>!!g.stats.all),form=aggregate(lastFive,team,'all');
  const venue=aggregate(teamGames(history,team,'all',team===fixture.home?'home':'away'),team,'all');
  const specialRow=special?.season===fixture.season&&special.through<fixture.date?special.windows['all/all']?.rows.find(r=>r.team===team):undefined;
  return {team,n:s.n,last,xgf:s.n?s.xgf/s.n:null,xga:s.n?s.xga/s.n:null,gf:s.n?s.gf/s.n:null,ga:s.n?s.ga/s.n:null,shooting:s.shooting,gsax:verified?xga-ga:null,savePercentage:verified&&shots?saves/shots*100:null,form:{n:form.n,xgf:form.n?form.xgf/form.n:null,xga:form.n?form.xga/form.n:null},venue:{n:venue.n,xgf:venue.n?venue.xgf/venue.n:null,xga:venue.n?venue.xga/venue.n:null},pp:specialRow?efficiency(specialRow.ppGoals,specialRow.ppChances):null,bp:specialRow?specialRow.pkChances?100-efficiency(specialRow.pkAgainst,specialRow.pkChances)!:null:null,ppChances:specialRow?.ppChances??null,bpChances:specialRow?.pkChances??null};
 }
 const home=profile(fixture.home),away=profile(fixture.away),enough=home.n>=3&&away.n>=3&&leagueMean!==null&&Number.isFinite(leagueMean);
 let title='Lagens förutsättningar inför nedsläpp',summary='Fler analyserade matcher behövs för en stabil matchprofil.';
 if(enough){
  if(home.xga!<leagueMean!*.9&&away.xga!<leagueMean!*.9){title='Två lag som släpper till lite';summary=`Båda lagen har lägre xGA per match än ligasnittet på ${f(leagueMean!)}. Följ vilka som lyckas öppna upp motståndarens försvar.`;}
  else if(home.xgf!>leagueMean!*1.08&&away.xgf!>leagueMean!*1.08){title='Två offensivt starka lag möts';summary=`Båda lagen skapar mer xG per match än ligasnittet på ${f(leagueMean!)}. Hur väl de begränsar varandras chanser blir intressant att följa.`;}
  else if(home.xgf!>away.xgf!*1.15){title=`${fixture.home}s chansskapande i fokus`;summary=`Hemmalaget har skapat ${f(home.xgf!)} xGF per match, mot ${f(away.xgf!)} för gästerna. ${fixture.away}s defensiv ställs mot ett lag med högre observerat chansskapande.`;}
  else if(away.xgf!>home.xgf!*1.15){title=`${fixture.away}s chansskapande i fokus`;summary=`Gästerna har skapat ${f(away.xgf!)} xGF per match, mot ${f(home.xgf!)} för hemmalaget. Hur ${fixture.home} begränsar chanserna är en del att följa.`;}
  else {title='Liknande nivå i chansskapandet';summary=`Lagen har skapat ${f(home.xgf!)} respektive ${f(away.xgf!)} xGF per match. Skillnader i defensiv, utdelning och special teams ger mer sammanhang.`;}
 }
 return {fixture,home,away,title,summary,enough,leagueMean,through:history.map(g=>g.date).sort().at(-1)??null,specialThrough:special&&special.through<fixture.date?special.through:null};
}
export type MatchPreview=ReturnType<typeof buildMatchPreview>;
