import {perspective,sumStats,type Game,type Scope} from './hockey.ts';
export function teamGames(games:Game[],team:string,range:string,venue:string){let rows=games.filter(g=>(g.home===team||g.away===team)&&(venue==='all'||(venue==='home'?g.home===team:g.away===team))).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));if(range!=='all')rows=rows.slice(-Number(range));return rows;}
export function aggregate(games:Game[],team:string,scope:Scope){return sumStats(games.flatMap(g=>{const s=perspective(g,team,scope);return s?[s]:[]}));}
export function previousWindow(games:Game[],team:string,range:string,venue:string){if(range==='all')return [];const rows=teamGames(games,team,'all',venue),size=Number(range);return rows.slice(Math.max(0,rows.length-2*size),Math.max(0,rows.length-size));}
export function ranking(rows:{team:string;value:number|null}[],team:string){const valid=rows.filter(r=>r.value!==null).sort((a,b)=>b.value!-a.value!);const own=valid.find(r=>r.team===team);return own?1+valid.filter(r=>r.value!>own.value!+1e-9).length:null;}
export function headline(s:ReturnType<typeof sumStats>){const gap=(s.gf-s.ga)-(s.xgf-s.xga);if(!s.n)return 'Analysunderlag saknas';if(gap<-.75)return 'Målutfallet är svagare än chansbilden.';if(gap>.75)return 'Målutfallet är starkare än chansbilden.';return 'Chansbild och målutfall ligger nära varandra.';}
export function barWidths(a:number,b:number){const sum=a+b;return sum>0?[a/sum*100,b/sum*100]:[50,50];}

// Descriptive editorial thresholds, not significance tests or forecasts.
export function performance(s:ReturnType<typeof sumStats>,goalies?:{gsax:number;complete:boolean}){
 const tolerance=Math.max(1,s.n*.3),chance=s.xgf-s.xga,offense=s.gf-s.xgf,defense=s.xga-s.ga;
 const direction=(v:number)=>v>tolerance?1:v<-tolerance?-1:0;
 const c=direction(chance),o=direction(offense),d=direction(defense);
 const verified=!!goalies?.complete&&Number.isFinite(goalies.gsax)&&Math.abs(goalies.gsax-defense)<.001;
 const chanceTitle=c>0?'Chansövertag':c<0?'Chansunderläge':'Jämn chansbild';
 const offenseTitle=o>0?'Fler mål än väntat':o<0?'Färre mål än väntat':'Utdelning nära xG';
 const defenseTitle=verified?(d>0?'Målvakter över förväntat':d<0?'Målvakter under förväntat':'Målvakter nära förväntat'):(d>0?'Färre insläppta än väntat':d<0?'Fler insläppta än väntat':'Insläppta mål nära xG');
 let title=c>0?'Laget skapar ett chansövertag.':c<0?'Laget skapar mindre än motståndarna.':'Chansbilden är jämn.';
 if(o>0&&d>0)title='Stark utdelning både framåt och bakåt.';
 else if(o<0&&d<0)title='Svag utdelning både framåt och bakåt.';
 else if(o<0&&d>0)title='Svag offensiv utdelning möter starkt utfall bakåt.';
 else if(o>0&&d<0)title='Stark offensiv utdelning möter svagt utfall bakåt.';
 else if(d>0&&o===0)title=verified?(c>0?'Chansövertag förstärks av målvakter över förväntat.':'Målvakter över förväntat stärker målutfallet.'):'Färre insläppta mål stärker målutfallet.';
 else if(o<0)title=c>0?'Chansövertaget ger svag offensiv utdelning.':'Den offensiva utdelningen är svagare än väntat.';
 else if(d<0)title=verified?'Målvakter under förväntat tynger målutfallet.':'Fler insläppta mål tynger målutfallet.';
 else if(o>0)title=c<0?'Stark offensiv utdelning kompenserar för chansunderläge.':'Stark offensiv utdelning stärker målutfallet.';
 else if(d>0)title=verified?'Målvakter över förväntat stärker målutfallet.':'Färre insläppta mål stärker målutfallet.';
 const chanceText=c>0?'Laget har skapat mer xG än motståndarna. Chansbilden ger stöd för ett positivt grundspel i urvalet.':c<0?'Motståndarna har skapat mer xG. Bra målutfall kan därför samexistera med ett underläge i chansskapandet.':'Laget och motståndarna har skapat ungefär lika mycket xG. Chansbilden ger inget tydligt övertag.';
 const offenseText=o>0?'Avsluten har gett fler mål än modellen uppskattat. Avslutsskicklighet, motståndarnas målvakter och variation kan bidra.':o<0?'Avsluten har gett färre mål än modellen uppskattat. Avslutsskicklighet, motståndarnas målvakter och variation kan bidra.':'Antalet gjorda mål ligger ungefär i linje med de skapade chansernas xG.';
 const defenseText=verified?(d>0?'Målvakternas positiva GSAx bidrar till ett starkare målutfall än chansbilden antyder.':d<0?'Målvakternas negativa GSAx bidrar till ett svagare målutfall än chansbilden antyder.':'Målvakterna har släppt in ungefär så många mål som modellen uppskattat.')+' GSAx och skillnaden mellan xG emot och insläppta mål är samma observation, inte två separata bevis.':(d>0?'Laget har släppt in färre mål än modellen uppskattat.':d<0?'Laget har släppt in fler mål än modellen uppskattat.':'Insläppta mål ligger ungefär i linje med xG emot.')+' Fullständigt målvaktsunderlag i samma spelform och matchurval saknas; skillnaden tillskrivs därför inte målvakterna.';
 return {title:s.n?title:'Analysunderlag saknas',chance:{title:chanceTitle,text:chanceText,value:chance},offense:{title:offenseTitle,text:offenseText,value:offense},defense:{title:defenseTitle,text:defenseText,value:defense},verifiedGoalies:verified,tolerance,note:`${s.n<10?'Litet urval: '+s.n+' matcher. ':''}Över förväntat betyder över modellens förväntan, inte automatiskt tur. Skicklighet, motståndarnas avslut och sådant modellen missar påverkar. Analysen beskriver urvalet och förutsäger inte kommande resultat.`};
}
