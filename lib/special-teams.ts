import {teams,type Game} from './hockey.ts';
import {nameByCode} from './shl.ts';
import {teamGames} from './analysis.ts';
export type SpecialTeamRow={team:string;games:number;ppGoals:number;ppAgainst:number;ppChances:number;ppShots:number;ppSeconds:number;pkGoals:number;pkAgainst:number;pkChances:number;pkShotsAgainst:number;pkSeconds:number};
export type SpecialTeamsSnapshot={season:string;updatedAt:string;through:string;windows:Record<string,{rows:SpecialTeamRow[];sources:string[]}>};
export function specialUrl(kind:'pp'|'pk',range='all',venue='all'){
 const module=kind==='pp'?'powerplay':'penaltyKilling';
 const q=new URLSearchParams({ssgtUuid:'qa98unlbd6',provider:'statnet',count:'25',moduleType:module,state:'active'});
 if(range!=='all')q.set('lastX',range);if(venue!=='all')q.set('location',venue);
 return `https://www.shl.se/api/statistics-v2/stats-info/teams_${module}?${q}`;
}
function count(v:unknown){if(typeof v!=='number'||!Number.isInteger(v)||v<0)throw Error('Invalid official special-teams count');return v;}
export function seconds(v:unknown){if(typeof v!=='string'||!/^\d+:\d{2}$/.test(v))throw Error('Invalid special-teams time');const [m,s]=v.split(':').map(Number);if(s>59)throw Error('Invalid seconds');return m*60+s;}
function rows(payload:unknown){const p=payload as {provider:string;stats:Record<string,any>[]}[];if(!Array.isArray(p)||p.length!==1||p[0].provider!=='statnet'||!Array.isArray(p[0].stats))throw Error('Unexpected SHL special-teams response');const map=new Map<string,Record<string,any>>();for(const r of p[0].stats){const team=nameByCode[r.info?.teamCode];if(!teams.includes(team)||map.has(team))throw Error('Unknown or duplicate team');map.set(team,r);}if(map.size!==teams.length)throw Error('Incomplete league special-teams coverage');return map;}
export function parseSpecialTeams(pp:unknown,pk:unknown,games:Game[],range='all',venue='all'):SpecialTeamRow[]{const a=rows(pp),b=rows(pk);return teams.map(team=>{const p=a.get(team)!,k=b.get(team)!;const n=count(p.GP);if(count(k.GP)!==n||n!==teamGames(games,team,range,venue).length)throw Error(`Official match selection mismatch: ${team}`);const r={team,games:n,ppGoals:count(p.PPG),ppAgainst:count(p.SHGA),ppChances:count(p.PPOpp),ppShots:count(p.PPSOG),ppSeconds:seconds(p.PPTime),pkGoals:count(k.SHG),pkAgainst:count(k.PPGA),pkChances:count(k.PKOpp),pkShotsAgainst:count(k.PPSOGA),pkSeconds:seconds(k.PKTime)};if(r.ppGoals>r.ppChances||r.pkAgainst>r.pkChances||r.ppGoals>r.ppShots||r.pkAgainst>r.pkShotsAgainst)throw Error('Inconsistent PP/BP counts');const expectedPP=r.ppChances?r.ppGoals/r.ppChances*100:0,expectedPK=r.pkChances?(1-r.pkAgainst/r.pkChances)*100:0;for(const [reported,expected] of [[p.PPPerc,expectedPP],[k.PKPerc,expectedPK]])if(!Number.isFinite(Number(reported))||Math.abs(Number(reported)-expected)>.011)throw Error('Special-teams percentage mismatch');return r;});}
export function validateLeague(rows:SpecialTeamRow[]){const sum=(k:keyof SpecialTeamRow)=>rows.reduce((n,r)=>n+Number(r[k]),0);for(const [a,b] of [['ppGoals','pkAgainst'],['ppAgainst','pkGoals'],['ppChances','pkChances'],['ppShots','pkShotsAgainst'],['ppSeconds','pkSeconds']] as const)if(sum(a)!==sum(b))throw Error(`PP/BP league totals disagree: ${a}`);}
export const efficiency=(goals:number,chances:number)=>chances?goals/chances*100:null;
export const per60=(value:number,time:number)=>time?value/time*3600:null;

// PP scoring rate minus opponent scoring rate during our BP, in percentage points.
export function specialTeamsNet(r:SpecialTeamRow){const pp=efficiency(r.ppGoals,r.ppChances),against=efficiency(r.pkAgainst,r.pkChances);return pp===null||against===null?null:pp-against;}
