import type {Game} from './hockey';
import {teamGames} from './analysis.ts';
// Same regulation-time, both-goalkeepers-present shot sample as team xG.
export function playerMatchStats(game:Game){
 const rows=new Map<string,{name:string;team:string;goals:number;sog:number;attempts:number;xg:number}>();
 for(const shot of game.shots||[]){if(!shot.eligible||shot.emptyNet||shot.period<1||shot.period>3||!shot.player||shot.player==='Okänd spelare'||!Number.isFinite(shot.xg))continue;
  const team=shot.home?game.home:game.away,key=team+'\0'+shot.player;
  const row=rows.get(key)||{name:shot.player,team,goals:0,sog:0,attempts:0,xg:0};
  row.attempts++;row.xg+=shot.xg!;if(shot.outcome==='goal')row.goals++;if(shot.outcome==='goal'||shot.outcome==='saved')row.sog++;rows.set(key,row);
 }
 return [...rows.values()].map(r=>({...r,shooting:r.sog?r.goals/r.sog*100:null}));
}

// Select the latest N matches independently for each club, then aggregate its shooters.
export function leaguePlayerStats(games:Game[],range='all',venue='all') {
 const teams=[...new Set(games.flatMap(g=>[g.home,g.away]))];
 const rows=new Map<string,ReturnType<typeof playerMatchStats>[number]&{matches:number}>();
 for(const team of teams)for(const game of teamGames(games,team,range,venue)){
  for(const player of playerMatchStats(game).filter(p=>p.team===team)){
   const key=team+'\0'+player.name;
   const row=rows.get(key)||{...player,goals:0,sog:0,attempts:0,xg:0,matches:0};
   row.goals+=player.goals;row.sog+=player.sog;row.attempts+=player.attempts;row.xg+=player.xg;row.matches++;rows.set(key,row);
  }
 }
 return [...rows.values()].map(r=>({...r,shooting:r.sog?r.goals/r.sog*100:null,finishing:r.goals-r.xg}));
}
