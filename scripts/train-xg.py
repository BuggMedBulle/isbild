"""Fit a small logistic xG model to historical SHL shots. No current-season data enters training."""
import json, pathlib, datetime
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss,log_loss,roc_auc_score
rows=json.load(open('/tmp/isbild-training.json'))
train=[r for r in rows if r['split']=='train'];test=[r for r in rows if r['split']=='test']
assert len({r['game'] for r in train})>=70 and len({r['game'] for r in test})>=15,'Historical fetch must finish before training.'
x=np.array([r['features'] for r in train]);y=np.array([r['goal'] for r in train]);xt=np.array([r['features'] for r in test]);yt=np.array([r['goal'] for r in test]);scaler=StandardScaler().fit(x);fit=LogisticRegression(C=.3,max_iter=1000).fit(scaler.transform(x),y);p=fit.predict_proba(scaler.transform(xt))[:,1];base=np.full(len(test),y.mean())
report={'trainingSeason':'2025/26','trainingGames':len({r['game'] for r in train}),'testGames':len({r['game'] for r in test}),'trainingShots':len(train),'testShots':len(test),'trainingGoals':int(y.sum()),'testGoals':int(yt.sum()),'brier':float(brier_score_loss(yt,p)),'baselineBrier':float(brier_score_loss(yt,base)),'logLoss':float(log_loss(yt,p)),'baselineLogLoss':float(log_loss(yt,base)),'auc':float(roc_auc_score(yt,p)),'predictedTestGoals':float(p.sum()),'trainDateRange':[min(r['date'] for r in train)[:10],max(r['date'] for r in train)[:10]],'testDateRange':[min(r['date'] for r in test)[:10],max(r['date'] for r in test)[:10]],'split':'Earlier games for training; later games held out. Current 2026/27 games excluded.','calibration':[{'range':[lo,hi],'shots':int(((p>=lo)&(p<hi)).sum()),'predicted':float(p[(p>=lo)&(p<hi)].mean()) if ((p>=lo)&(p<hi)).any() else None,'actual':float(yt[(p>=lo)&(p<hi)].mean()) if ((p>=lo)&(p<hi)).any() else None} for lo,hi in [(0,.05),(.05,.1),(.1,.2),(.2,1)]]}
assert report['logLoss']<report['baselineLogLoss'],'Model must improve on flat probability baseline.'
model={'name':'Isbild xG v0.2 · experimentell','features':['distance / 10','distance² / 1000','angle / (pi/2)','lateral distance² / 1000','same-team rebound within 3s'],'mean':scaler.mean_.tolist(),'scale':scaler.scale_.tolist(),'coefficients':fit.coef_[0].tolist(),'intercept':float(fit.intercept_[0]),'trainedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'validation':report}
old=json.load(open('data/xg-model.json'))
oldp=1/(1+np.exp(-(np.sum(((xt-np.array(old['mean']))/np.array(old['scale']))*np.array(old['coefficients']),axis=1)+old['intercept'])))
report['previousModelLogLoss']=float(log_loss(yt,oldp));report['previousModelBrier']=float(brier_score_loss(yt,oldp))
# Promotion requires both metrics to improve over the previous model on this holdout.
accepted=report['logLoss']<report['previousModelLogLoss'] and report['brier']<report['previousModelBrier']
# The prior model may have seen some of these games. This is disclosed in the report.
report['comparisonCaveat']='Previous model used 100 sampled games across the season; its exposure to the new holdout differs. Candidate uses only the earlier 80 percent.'
report['accepted']=accepted
pathlib.Path('data/model-evaluation.json').write_text(json.dumps(report,indent=2)+'\n')
if accepted:pathlib.Path('data/xg-model.json').write_text(json.dumps(model,indent=2)+'\n')
print(json.dumps(report,indent=2))
