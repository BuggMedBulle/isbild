import {type Game} from './hockey.ts';
import {teamGames} from './analysis.ts';
export type GoalieRow={id:string;name:string;team:string;games:number;shots:number;saves:number;goals:number;xga:number;savePercentage:number|null;gsax:number};
export function goalieStats(games:Game[],range='all',venue='all',team?:string){
 const clubs=team?[team]:[...new Set(games.flatMap(g=>[g.home,g.away]))];const rows:GoalieRow[]=[];let missing=0,total=0;
 for(const club of clubs){const byGoalie=new Map<string,{row:GoalieRow;games:Set<string>}>();for(const game of teamGames(games,club,range,venue)){for(const shot of game.shots||[]){if(!shot.eligible||shot.emptyNet||shot.period>3||shot.home===(game.home===club)||shot.outcome==='blocked')continue;total++;if(!shot.goalie||typeof shot.xg!=='number'||!Number.isFinite(shot.xg)){missing++;continue;}const goalie=shot.goalie;let record=byGoalie.get(goalie.id);if(!record){record={row:{id:goalie.id,name:goalie.name,team:club,games:0,shots:0,saves:0,goals:0,xga:0,savePercentage:null,gsax:0},games:new Set()};byGoalie.set(goalie.id,record);}record.games.add(game.id);record.row.xga+=shot.xg;if(shot.outcome==='saved'){record.row.shots++;record.row.saves++;}else if(shot.outcome==='goal'){record.row.shots++;record.row.goals++;}}}for(const {row,games:played} of byGoalie.values()){row.games=played.size;row.savePercentage=row.shots?row.saves/row.shots*100:null;row.gsax=row.xga-row.goals;rows.push(row);}}
 return {rows:rows.sort((a,b)=>b.gsax-a.gsax||b.shots-a.shots||a.name.localeCompare(b.name,'sv')),missing,total};
}
