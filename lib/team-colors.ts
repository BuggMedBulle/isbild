// Display accents sampled from public/clubs/*.svg and lightened for dark surfaces.
// These are UI colours, not official brand specifications. Order: primary, alternate.
export const teamAccents:Record<string,readonly [string,string]>={
 'Djurgårdens IF':['#439FE0','#FFEC0D'],
 'Brynäs IF':['#FFCC00','#EEEEEE'],
 'Färjestad BK':['#4DBB8C','#E9B646'],
 'Frölunda HC':['#ED7185','#49B995'],
 'HV71':['#539DE0','#FFD500'],
 'Björklöven':['#4DB58E','#FFD000'],
 'Linköping HC':['#539DE0','#F17A8B'],
 'Luleå Hockey':['#F37175','#FFCC00'],
 'Malmö Redhawks':['#EE748C','#C5C4C4'],
 'Örebro Hockey':['#F2768D','#EEEEEE'],
 'Rögle BK':['#50BD80','#F6BE00'],
 'Skellefteå AIK':['#FBB906','#EEEEEE'],
 'Timrå IK':['#F17C72','#539DE0'],
 'Växjö Lakers':['#F69A61','#539DE0'],
};
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const distance=(a:string,b:string)=>Math.hypot(...rgb(a).map((v,i)=>v-rgb(b)[i]));
export function matchupAccents(home:string,away:string):[string,string]{
 // Canonical ordering makes colour assignments independent of home/away and favourite.
 const [first,second]=[home,away].sort(),a=teamAccents[first]??['#8DCEF7','#EEEEEE'],b=teamAccents[second]??['#F6AD79','#EEEEEE'];
 let pair:[string,string]=[a[0],b[0]];
 if(distance(...pair)<130){
  let best=-Infinity;
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){
   const score=distance(a[i],b[j])-25*(i+j);
   if(score>best){best=score;pair=[a[i],b[j]];}
  }
 }
 return home===first?pair:[pair[1],pair[0]];
}
