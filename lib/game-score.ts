/** Hockeysiffror's published individual offensive weights.
 * This is a raw contribution, NOT their per-60, above-average Game Score.
 * No missing component may be silently replaced with zero.
 */
export const offensiveWeights={goals:.75,firstAssists:.7,secondAssists:.55,xg:.5} as const;
export function offensiveContribution(input:Record<keyof typeof offensiveWeights,number|null>){
 if(Object.keys(offensiveWeights).some(key=>{const value=input[key as keyof typeof input];return value===null||!Number.isFinite(value)||value<0||(key!=='xg'&&!Number.isInteger(value));}))return null;
 if(Object.keys(offensiveWeights).some(key=>typeof input[key as keyof typeof input]!=='number'))return null;
 return Object.entries(offensiveWeights).reduce((sum,[key,weight])=>sum+input[key as keyof typeof input]!*weight,0);
}
