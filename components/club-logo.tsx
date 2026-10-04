import {clubAssets} from '@/lib/clubs';
import {short} from '@/lib/hockey';
export function ClubLogo({team,size=32,decorative=false}:{team:string;size?:number;decorative?:boolean}){const asset=clubAssets[team];return asset?<img className="club-logo" src={'.'+asset.file} width={size} height={size} alt={decorative?'':`${team} klubbemblem`} style={{width:size,height:size}}/>:<span className="club-fallback" style={{width:size,height:size}} aria-label={team}>{short[team]||team.slice(0,3)}</span>;}
