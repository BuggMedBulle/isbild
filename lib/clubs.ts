import assets from '@/data/club-assets.json';
import haAssets from '@/data/ha-club-assets.json';
import {nameByCode} from './shl';
export const clubAssets=Object.fromEntries([...assets,...haAssets].map(a=>[nameByCode[a.code]||a.name,a]));
export const slugs:Record<string,string>={'Djurgårdens IF':'djurgarden','Brynäs IF':'brynas','Färjestad BK':'farjestad','Frölunda HC':'frolunda','HV71':'hv71','Björklöven':'bjorkloven','Linköping HC':'linkoping','Luleå Hockey':'lulea','Malmö Redhawks':'malmo','Örebro Hockey':'orebro','Rögle BK':'rogle','Skellefteå AIK':'skelleftea','Timrå IK':'timra','Växjö Lakers':'vaxjo'};
export const teamFromSlug=(slug:string)=>Object.keys(slugs).find(t=>slugs[t]===slug);
