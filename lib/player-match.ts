import type {Game} from './hockey';
import {teamGames} from './analysis.ts';
import {offensiveContribution,defensiveContribution} from './game-score.ts';
type PlayerRow={name:string;team:string;goals:number;sog:number;attempts:number;xg:number;firstAssists:number|null;secondAssists:number|null;offense:number|null;shooting:number|null;penaltyMinutes:number|null;goalsAgainstOnIce:number|null;defense:number|null;partialScore:number|null};
const included=(s:NonNullable<Game['shots']>[number])=>s.eligible&&!s.emptyNet&&s.period>=1&&s.period<=3;
function coverage(game:Game,team:string){
 const shots=(game.shots||[]).filter(s=>included(s)&&(s.home?game.home:game.away)===team);
 return game.playerDataVersion===1&&shots.length>0&&shots.every(s=>Number.isFinite(s.xg)&&s.xg!>=0&&s.player&&s.player!=='Okänd spelare'&&(s.outcome!=='goal'||s.assists&&['first','second'].every(k=>s.assists![k as 'first'|'second']===null||(typeof s.assists![k as 'first'|'second']==='string'&&s.assists![k as 'first'|'second']!.trim()&&!s.assists![k as 'first'|'second']!.includes('undefined')))));
}
export function playerMatchStats(game:Game):PlayerRow[]{
 const rows=new Map<string,PlayerRow>();
 const keepers=new Set((game.shots||[]).map(s=>s.goalie?.name).filter(Boolean));
 const get=(name:string,team:string)=>{const key=team+'\0'+name;let row=rows.get(key);if(!row){row={name,team,goals:0,sog:0,attempts:0,xg:0,firstAssists:0,secondAssists:0,offense:null,shooting:null,penaltyMinutes:0,goalsAgainstOnIce:0,defense:null,partialScore:null};rows.set(key,row);}return row;};
 for(const shot of game.shots||[]){if(!included(shot)||!shot.player||shot.player==='Okänd spelare'||!Number.isFinite(shot.xg))continue;
  const team=shot.home?game.home:game.away,row=get(shot.player,team);
  row.attempts++;row.xg+=shot.xg!;if(shot.outcome==='goal')row.goals++;if(shot.outcome==='goal'||shot.outcome==='saved')row.sog++;
  if(shot.outcome==='goal')for(const [key,field] of [['first','firstAssists'],['second','secondAssists']] as const){const name=shot.assists?.[key];if(name&&name.trim()&&!name.includes('undefined')&&!keepers.has(name))get(name,team)[field]!++;}
 }
 for(const shot of game.shots||[])if(included(shot)&&shot.outcome==='goal')for(const name of shot.defendingSkaters||[])if(!keepers.has(name))get(name,shot.home?game.away:game.home).goalsAgainstOnIce!++;
 for(const p of game.defenseData?.penalties||[])if(!keepers.has(p.name))get(p.name,p.home?game.home:game.away).penaltyMinutes!+=p.minutes;
 return [...rows.values()].filter(r=>!keepers.has(r.name)).map(r=>{const complete=coverage(game,r.team),defComplete=game.defenseData?.version===1&&game.defenseData.complete[r.team===game.home?'home':'away'];const offense=complete?offensiveContribution(r):null,defense=defComplete?defensiveContribution(r):null;return {...r,penaltyMinutes:defComplete?r.penaltyMinutes:null,goalsAgainstOnIce:defComplete?r.goalsAgainstOnIce:null,defense,partialScore:offense!==null&&defense!==null?offense+defense:null,firstAssists:complete?r.firstAssists:null,secondAssists:complete?r.secondAssists:null,offense,shooting:r.sog?r.goals/r.sog*100:null};});
}
// Latest N team matches; never label matches with recorded events as official GP.
export function leaguePlayerStats(games:Game[],range='all',venue='all') {
 const teams=[...new Set(games.flatMap(g=>[g.home,g.away]))];
 const rows=new Map<string,PlayerRow&{matches:number}>();
 for(const team of teams){const selected=teamGames(games,team,range,venue),complete=selected.every(g=>coverage(g,team)),defComplete=selected.every(g=>g.defenseData?.version===1&&g.defenseData.complete[team===g.home?'home':'away']);
  for(const game of selected)for(const player of playerMatchStats(game).filter(p=>p.team===team)){
   const key=team+'\0'+player.name;
   const row=rows.get(key)||{...player,goals:0,sog:0,attempts:0,xg:0,firstAssists:0,secondAssists:0,penaltyMinutes:0,goalsAgainstOnIce:0,matches:0};
   row.goals+=player.goals;row.sog+=player.sog;row.attempts+=player.attempts;row.xg+=player.xg;row.matches++;
   row.firstAssists=complete?(row.firstAssists??0)+player.firstAssists!:null;
   row.secondAssists=complete?(row.secondAssists??0)+player.secondAssists!:null;
   row.penaltyMinutes=defComplete?(row.penaltyMinutes??0)+player.penaltyMinutes!:null;
   row.goalsAgainstOnIce=defComplete?(row.goalsAgainstOnIce??0)+player.goalsAgainstOnIce!:null;
   rows.set(key,row);
  }
 }
 return [...rows.values()].map(r=>{const offense=offensiveContribution(r),defense=defensiveContribution(r);return {...r,offense,defense,partialScore:offense!==null&&defense!==null?offense+defense:null,shooting:r.sog?r.goals/r.sog*100:null,finishing:r.goals-r.xg};});
}
