SHL source and model, captured 2026-10-04

Public schedule and play-by-play: https://www.shl.se/api/sports-v2/game-schedule
and https://www.shl.se/api/gameday/play-by-play/<game UUID>.
No authentication or paid API. Availability and format are not guaranteed.

Coordinates follow the SHL ShotPlot mapping: locationX * .0925 metres from
attacking goal line, locationY * .1003846154 metres across the rink. Negative
locationX indicates behind the goal. GoalSection >0 saved, 0/-1 missed,
-3 blocked, -2 non-attempt. Goal events are separate attempts.

Only regulation and both goalkeepers on ice; all strengths combined.
Exclude penalty shots. Highest event revision wins. Current snapshot rejects
invalid coordinates; five implausible historical coordinates were excluded
from training. Rebounds mean the immediately preceding attempt by the same
team within 3s in the same period, unless that attempt was blocked or a goal.

Model logistic regression on unblocked attempts, train80 earlier games,
test20 later games sampled evenly across 2025/26. Current season excluded.
Standardized distance, squared distance, angle, lateral squared distance,
and rebound features. Validation and calibration bins in xg-model.json.

Reproduce from project root (requires Python numpy and scikit-learn):
python3 scripts/fetch-shl.py
node scripts/prepare-training.mjs
python3 scripts/train-xg.py
node scripts/prepare-shl.mjs
node tests/shl.mjs

Current runtime refresh only fetches completed new games and recent games
older than12h. Three games per request, cached persistently in D1.
Earlier cached games are preserved on source errors. Refresh is manual.
