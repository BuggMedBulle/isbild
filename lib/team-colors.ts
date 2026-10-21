// Exact club colours supplied by the owner; no lightening or hue changes.
// Existing data names alias IF Björklöven, Luleå HF and Örebro HK.
export const teamAccents:Record<string,readonly string[]>={
 'Björklöven':['#016243','#F0D200'],
 'Brynäs IF':['#000000','#FFD121','#ED1C24'],
 'Djurgårdens IF':['#002554','#E21F26','#FFEC0D'],
 'Frölunda HC':['#00573F','#CE0014'],
 'Färjestad BK':['#009B5E','#FFD121'],
 'HV71':['#0C2950','#FCD213'],
 'Linköping HC':['#003690','#FF151F','#000000'],
 'Luleå Hockey':['#E30613','#FFCC00','#1D1D1B'],
 'Malmö Redhawks':['#ED1C24','#FFF200','#000000'],
 'Rögle BK':['#118235','#B0141E','#F8B30A'],
 'Skellefteå AIK':['#FFC323','#000000'],
 'Timrå IK':['#EB2B2E','#264FA6'],
 'Växjö Lakers':['#013A80','#F37835','#B39759'],
 'Örebro Hockey':['#ED1737','#9C0E21','#000000'],
};
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const distance=(a:string,b:string)=>Math.hypot(...rgb(a).map((v,i)=>v-rgb(b)[i]));
const luminance=(hex:string)=>rgb(hex).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const contrast=(hex:string)=>(luminance(hex)+.05)/(luminance('#20272C')+.05);
function visiblePalette(team:string,fallback:readonly string[]){
 const palette=teamAccents[team]??fallback;
 const visible=palette.filter(c=>contrast(c)>=3);
 // When neither brand colour reaches 3:1, keep its most visible exact colour.
 // Text remains neutral and chart shapes have an additional light outline.
 return visible.length?visible:[...palette].sort((a,b)=>contrast(b)-contrast(a)).slice(0,1);
}
export function matchupAccents(home:string,away:string):[string,string]{
 // Canonical ordering makes colour assignments independent of home/away and favourite.
 const [first,second]=[home,away].sort(),a=visiblePalette(first,['#8DCEF7','#EEEEEE']),b=visiblePalette(second,['#F6AD79','#EEEEEE']);
 let pair:[string,string]=[a[0],b[0]];
 if(distance(...pair)<130){
  let best=-Infinity;
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){
   const score=distance(a[i],b[j])-25*(i+j);
   if(score>best){best=score;pair=[a[i],b[j]];}
  }
 }
 return home===first?pair:[pair[1],pair[0]];
}
