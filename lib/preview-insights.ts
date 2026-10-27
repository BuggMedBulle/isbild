import type {MatchPreview} from './preview.ts';

type Insight={id:string;topic:string;score:number;title:string;text:string};
const f=(v:number,d=2)=>v.toLocaleString('sv-SE',{minimumFractionDigits:d,maximumFractionDigits:d});
const signed=(v:number)=>`${v>0?'+':''}${f(v)}`;
const valid=(...values:(number|null)[])=>values.every(v=>v!==null&&Number.isFinite(v));

// Editorial salience, not probability or statistical significance. Never randomize.
export function matchWatchPoints(p:MatchPreview):Insight[]{
 const points:Insight[]=[],mean=p.leagueMean;
 if(!p.enough||mean===null||!Number.isFinite(mean)||mean<=0)return [];
 const add=(id:string,topic:string,score:number,title:string,text:string,n:number)=>points.push({id,topic,score:score*Math.min(1,n/10),title,text});
 const pairN=Math.min(p.home.n,p.away.n);
 for(const [a,b] of [[p.home,p.away],[p.away,p.home]]){
  if(valid(a.xgf,b.xga)){
   const attack=a.xgf!/mean-1,defence=b.xga!/mean-1;
   if(attack>=.08&&defence>=.08)add(`opening-${a.team}`,'chances',2+attack+defence,`${a.team}s anfall möter ett försvar som släpper till`,`${a.team} skapar ${f(a.xgf!)} xGF per match och ${b.team} släpper till ${f(b.xga!)} xGA. Båda ligger över ligasnittet ${f(mean)}. Kan ${b.team} begränsa just den styrkan?`,pairN);
   if(attack>=.08&&defence<=-.10)add(`clash-${a.team}`,'chances',2+attack-defence,`${a.team}s offensiv får ett defensivt test`,`${a.team} skapar ${f(a.xgf!)} xGF per match, men ${b.team} släpper bara till ${f(b.xga!)} xGA, mot ligasnittet ${f(mean)}. Här möts ett högt chansskapande och ett försvar som begränsat chanserna.`,pairN);
  }
  const finish=valid(a.gf,a.xgf)?a.gf!-a.xgf!:null,keeper=b.gsax===null?null:b.gsax/b.n;
  if(finish!==null&&Math.abs(finish)>=.25){
   const duel=finish<=-.25&&keeper!==null&&keeper>=.20;
   add(`finishing-${a.team}`,'conversion',1.4+Math.abs(finish)+(duel?Math.abs(keeper!):0),duel?`${a.team}s låga utdelning möter starkt målvaktsspel`:finish<0?`${a.team} får inte betalt för chanserna`:`${a.team} gör fler mål än chansbilden antyder`,`${a.team} gör ${f(a.gf!)} mål från ${f(a.xgf!)} xG per match (${signed(finish)} mål). ${duel?`${b.team}s målvakter har tillsammans ${signed(b.gsax!)} GSAx på ${b.n} matcher. Det gäller lagets använda målvakter, inte en bekräftad startmålvakt.`:`Mot ${b.team}, som släpper till ${f(b.xga!)} xGA per match, blir både chanskvalitet och avslut värda att följa. Skillnaden mot xG bevisar inte tur eller otur.`}`,pairN);
  }
  if(a.gsax!==null&&Number.isFinite(a.gsax)&&Math.abs(a.gsax/a.n)>=.25){
   const rate=a.gsax/a.n;
   add(`goalies-${a.team}`,'conversion',1.5+Math.abs(rate),rate>0?`${a.team}s målvakter har hållit nere målutfallet`:`${a.team} har släppt in mer än xG antyder`,`${signed(a.gsax)} GSAx på ${a.n} matcher (${signed(rate)} per match). Nu väntar ${b.team}, som skapar ${f(b.xgf!)} xGF per match. Värdet gäller samtliga använda målvakter; startmålvakten är inte bekräftad.`,pairN);
  }
  // Avoid calling the same last-five sample a form change; need a broader profile.
  if(a.previousForm?.n===5&&a.form.n===5&&valid(a.previousForm.xgf,a.previousForm.xga,a.form.xgf,a.form.xga)){
   const base=a.previousForm.xgf!-a.previousForm.xga!,recent=a.form.xgf!-a.form.xga!,delta=recent-base;
   if(Math.abs(delta)>=.40)add(`form-${a.team}`,'form',1.3+Math.abs(delta),delta>0?`${a.team}s senaste chansbild är starkare`:`${a.team}s senaste chansbild är svagare`,`${a.team}s senaste fem matcher ger ${f(a.form.xgf!)} xGF och ${f(a.form.xga!)} xGA per match: ${signed(recent)} i xG-skillnad, mot ${signed(base)} i föregående fem matcher. Följ om den bilden håller mot ${b.team}. Perioderna överlappar inte; motståndet är inte justerat.`,a.n);
  }
  if(p.specialThrough&&a.ppChances!==null&&b.bpChances!==null&&a.ppChances>=15&&b.bpChances>=15&&valid(a.pp,b.bp)){
   const strong=a.pp!>=25,weak=b.bp!<=75,stout=b.bp!>=85;
   if((strong&&(weak||stout))||(a.pp!<=15&&stout))add(`special-${a.team}`,'special',1.5+Math.abs(a.pp!-20)/20+Math.abs(b.bp!-80)/20,strong&&weak?`${a.team}s powerplay möter ett sårbart boxplay`:strong?`Starkt powerplay mot starkt boxplay`:`${a.team}s powerplay får en tuff uppgift`,`${a.team} har ${f(a.pp!,1)} % i PP (${a.ppChances} överlägen). ${b.team} har ${f(b.bp!,1)} % i BP (${b.bpChances} underlägen). Det gör utvisningarna särskilt intressanta i denna riktning. Säsongsdata till ${p.specialThrough}; inga antaganden om hur många utvisningar det blir.`,Math.min(a.ppChances,b.bpChances));
  }
 }
 if(valid(p.home.xga,p.away.xga)&&p.home.xga!<=mean*.9&&p.away.xga!<=mean*.9)add('tight','chances',2+(2*mean-p.home.xga!-p.away.xga!)/mean,'Båda lagen begränsar chanserna',`${p.home.team} släpper till ${f(p.home.xga!)} xGA per match och ${p.away.team} ${f(p.away.xga!)}. Båda är minst 10 % under ligasnittet ${f(mean)}. Vem lyckas skapa utrymme mot det andra lagets försvar?`,pairN);
 if(valid(p.home.xgf,p.away.xgf)&&Math.abs(p.home.xgf!-p.away.xgf!)/mean>=.15){
  const [a,b]=p.home.xgf!>p.away.xgf!?[p.home,p.away]:[p.away,p.home];
  add('attack-gap','chances',1+Math.abs(a.xgf!-b.xgf!)/mean,`${a.team} har skapat mer framåt`,`${f(a.xgf!)} mot ${f(b.xgf!)} xGF per match för ${b.team}. Följ om skillnaden syns i detta möte; tidigare motstånd och hemmafördel är inte justerade.`,pairN);
 }
 const topics=new Set<string>();
 return points.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).filter(point=>{if(topics.has(point.topic))return false;topics.add(point.topic);return true;}).slice(0,3);
}

export function previewStory(p:MatchPreview){const first=matchWatchPoints(p)[0];return first?{title:first.title,text:first.text}:{title:p.title,text:p.summary};}
