import type {Game} from './hockey';
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
