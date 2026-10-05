"""Fetch public SHL events for a reproducible model and current snapshot. No account/key required."""
import json,pathlib,urllib.request,concurrent.futures
root=pathlib.Path('/tmp/isbild-data');root.mkdir(exist_ok=True)
def get(url):
 request=urllib.request.Request(url,headers={'User-Agent':'Isbild/1.0 personal hockey analytics','Accept':'application/json'})
 with urllib.request.urlopen(request,timeout=18) as r:return json.load(r)
def schedule(season):
 return get('https://www.shl.se/api/sports-v2/game-schedule?seasonUuid='+season+'&seriesUuid=qQ9-bb0bzEWUk&gameTypeUuid=qQ9-af37Ti40B&gamePlace=all&played=all')['gameInfo']
current=[g for g in schedule('ndcf81nlb3') if g['state']=='post-game']
historical=sorted([g for g in schedule('xs4m9qupsi') if g['state']=='post-game'],key=lambda g:g['startDateTime'])
selected=historical
(root/'current-schedule.json').write_text(json.dumps(current));(root/'training-schedule.json').write_text(json.dumps(selected))
def fetch(g):
 uid=g['uuid'];out=root/(uid+'.json')
 if out.exists():return uid,None
 try:
  events=get('https://www.shl.se/api/gameday/play-by-play/'+uid)
  if not isinstance(events,list) or len(events)<20:raise ValueError('Missing events')
  out.write_text(json.dumps(events));return uid,None
 except Exception as e:return uid,str(e)
errors=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,(uid,error) in enumerate(pool.map(fetch,current+selected)):
  if error:errors.append({'id':uid,'error':error})
  if i%15==0 or error:print('Fetched',i+1,'/',len(current+selected),'errors',len(errors),flush=True)
(root/'fetch-errors.json').write_text(json.dumps(errors))
if errors:raise RuntimeError(errors)
