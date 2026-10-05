import assert from 'node:assert/strict';import fs from 'node:fs';
import {parseSpecialTeams,validateLeague,efficiency,per60,seconds,specialTeamsNet} from '../lib/special-teams.ts';
const fixture=JSON.parse(fs.readFileSync(new URL('fixtures/special-teams-source.json',import.meta.url)));
const games=JSON.parse(fs.readFileSync(new URL('../data/shl-2026.json',import.meta.url))).games;
// Fixture is an official six-game snapshot, independent of later season updates.
const fixtureGames=games.filter(g=>g.date<='2026-10-03');
const rows=parseSpecialTeams(fixture.pp,fixture.pk,fixtureGames);validateLeague(rows);
const dif=rows.find(r=>r.team==='Djurgårdens IF');assert.equal(dif.ppGoals,4);assert.equal(dif.ppChances,16);assert.equal(dif.ppShots,27);assert.equal(dif.ppSeconds,1639);assert.equal(dif.pkShotsAgainst,34);assert.equal(efficiency(dif.ppGoals,dif.ppChances),25);assert.equal(100-efficiency(dif.pkAgainst,dif.pkChances),75);
assert.equal(efficiency(0,0),null);assert.equal(per60(2,0),null);assert.equal(per60(2,120),60);assert.equal(seconds('125:09'),7509);assert.throws(()=>seconds('10:60'));
let bad=structuredClone(fixture.pp);bad[0].stats.pop();assert.throws(()=>parseSpecialTeams(bad,fixture.pk,fixtureGames));
bad=structuredClone(fixture.pp);bad[0].stats[0].PPPerc='99';assert.throws(()=>parseSpecialTeams(bad,fixture.pk,fixtureGames));
assert.throws(()=>parseSpecialTeams(fixture.pp,fixture.pk,fixtureGames,'5','home'));
let mismatch=structuredClone(rows);mismatch[0].pkShotsAgainst++;assert.throws(()=>validateLeague(mismatch));
const live=JSON.parse(fs.readFileSync(new URL('../data/special-teams.json',import.meta.url)));assert.equal(live.windows['all/all'].rows.length,14);validateLeague(live.windows['all/all'].rows);assert.equal(live.season,'2026/27');
console.log('PASS: official PP/BP fixture, reciprocal totals, zero denominators, malformed data and selection mismatch');

assert.equal(specialTeamsNet(dif),0);assert.equal(specialTeamsNet({...dif,ppGoals:6}),12.5);assert.equal(specialTeamsNet({...dif,pkAgainst:6}),-12.5);assert.equal(specialTeamsNet({...dif,ppChances:0}),null);assert.equal(specialTeamsNet({...dif,pkChances:0}),null);
