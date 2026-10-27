import {buildMatchPreview,predictMatch,type Fixture} from './preview.ts';
import type {Game} from './hockey.ts';

// Expanding-window evaluation. Same-day games are never available to a forecast.
// Fixed model parameters; this is a retrospective check, not a held-out tuning set.
export function evaluatePredictions(games:Game[]){
 const rows=games.flatMap(g=>{
  const actual=g.stats.all;if(!actual)return [];
  const fixture:Fixture={id:g.id,home:g.home,away:g.away,date:g.date,time:'',startAt:g.date+'T12:00:00Z',venue:null,season:g.season,state:'finished'};
  const p=buildMatchPreview(games,fixture),model=p.prediction;if(!model||p.leagueMean===null)return [];
  const neutral={n:3,xgf:p.leagueMean,xga:p.leagueMean},baseline=predictMatch(neutral,neutral,p.leagueMean)!;
  const outcome=actual.gf>actual.ga?0:actual.gf===actual.ga?1:2;
  const brier=(probs:number[])=>probs.reduce((s,v,i)=>s+(v-Number(i===outcome))**2,0);
  return [{id:g.id,date:g.date,brier:brier(model.probabilities),baselineBrier:brier(baseline.probabilities),logLoss:-Math.log(Math.max(1e-15,model.probabilities[outcome])),error:(Math.abs(model.homeXg-actual.gf)+Math.abs(model.awayXg-actual.ga))/2,probabilities:model.probabilities,outcome}];
 });
 const mean=(key:'brier'|'baselineBrier'|'logLoss'|'error')=>rows.length?rows.reduce((s,r)=>s+r[key],0)/rows.length:null;
 return {n:rows.length,excluded:games.length-rows.length,through:rows.map(r=>r.date).sort().at(-1)??null,brier:mean('brier'),baselineBrier:mean('baselineBrier'),logLoss:mean('logLoss'),goalMAE:mean('error'),rows};
}
