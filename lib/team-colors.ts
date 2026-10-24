// Exact club colours supplied by the owner; no lightening or hue changes.
// Existing data names alias IF Björklöven, Luleå HF and Örebro HK.
export const teamAccents:Record<string,readonly string[]>={
 'Björklöven':['#016243','#F0D200'],
 'Brynäs IF':['#FFD121','#000000','#ED1C24'],
 'Djurgårdens IF':['#002554','#E21F26','#FFEC0D'],
 'Frölunda HC':['#CE0014','#00573F'],
 'Färjestad BK':['#009B5E','#FFD121'],
 'HV71':['#FCD213','#0C2950'],
 'Linköping HC':['#003690','#FF151F','#000000'],
 'Luleå Hockey':['#E30613','#FFCC00','#1D1D1B'],
 'Malmö Redhawks':['#ED1C24','#FFF200','#000000'],
 'Rögle BK':['#118235','#B0141E','#F8B30A'],
 'Skellefteå AIK':['#FFC323','#000000'],
 'Timrå IK':['#EB2B2E','#264FA6'],
 'Växjö Lakers':['#F37835','#013A80','#B39759'],
 'Örebro Hockey':['#ED1737','#9C0E21','#000000'],
};
// The first colour is the owner's chosen primary, even for dark or similar colours.
// Neutral text, chart outlines and team labels provide contrast without changing identity.
export function matchupAccents(home:string,away:string):[string,string]{
 return [teamAccents[home]?.[0]??'#8DCEF7',teamAccents[away]?.[0]??'#F6AD79'];
}
