'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const core=require('./phase9-core.js');
const mk=(date,exercise,weight,reps,notes='')=>({id:Math.random(),date,exercise,weight,reps,notes});
const days=[
  mk('2026-10-12T14:00:00Z','Bench Press',100,12),
  mk('2026-10-12T14:10:00Z','Bench Press',100,12),
  mk('2026-10-19T14:00:00Z','Bench Press',100,12),
  mk('2026-10-19T14:10:00Z','Bench Press',100,12)
];
test('requires two completed sessions before recommending increases',()=>{
  assert.equal(core.progression(days.slice(0,2),'Bench Press','muscle',5,'2026-10-25T12:00:00Z').kind,'reps');
  assert.deepEqual(
    [core.progression(days,'Bench Press','muscle',5,'2026-10-25T12:00:00Z').kind,
     core.progression(days,'Bench Press','muscle',5,'2026-10-25T12:00:00Z').weight],
    ['increase',105]
  );
});
test('today sets are not treated as a finished workout',()=>{
  assert.notEqual(core.progression(days,'Bench Press','muscle',5,'2026-10-19T15:00:00Z').kind,'increase');
});
test('hold weight below minimum and progress reps when appropriate',()=>{
  const tooHeavy=days.map(s=>({...s,reps:3}));
  assert.equal(core.progression(tooHeavy,'Bench Press','muscle',5,'2026-10-25T12:00:00Z').kind,'hold');
  assert.equal(core.progression(days.slice(0,2),'Bench Press','muscle',5,'2026-10-25T12:00:00Z').weight,100);
});
test('special drop sets do not authorize weight increases',()=>{
  const special=days.slice(2).map(s=>({...s,notes:'[Drop set] fatigue'}));
  assert.notEqual(core.progression(days.slice(0,2).concat(special),'Bench Press','muscle',5,'2026-10-25T12:00:00Z').kind,'increase');
});
test('explosive exercises and bodyweight do not auto-increase load',()=>{
  assert.equal(core.progression(days.map(s=>({...s,exercise:'Jump Squat'})),'Jump Squat','power',5,'2026-10-25T12:00:00Z').kind,'power');
  assert.equal(core.progression(days.map(s=>({...s,weight:0})),'Bench Press','muscle',5,'2026-10-25T12:00:00Z').kind,'bodyweight');
});
test('group mapping including user override and unknown exercise',()=>{
  assert.equal(core.primaryGroup('Bench Press'),'Chest');
  assert.equal(core.primaryGroup('Dumbbell Romanian Deadlift'),'Legs');
  assert.equal(core.primaryGroup('Alien movement'),'Unmapped');
  assert.equal(core.primaryGroup('Alien movement',{'Alien movement':'Back'}),'Back');
});
test('per-group set counts do not double-count compound moves',()=>{
  const summary=core.muscleSummary(days.concat([mk('2026-10-18T14:00:00Z','Goblet Squat',55,10)]),8,{},'2026-10-25T12:00:00Z');
  assert.equal(summary.groups.find(g=>g.name==='Chest').sets,4);
  assert.equal(summary.groups.find(g=>g.name==='Chest').volume,4800);
  assert.equal(summary.groups.find(g=>g.name==='Legs').sets,1);
});
test('reject malformed history and exclude future sets',()=>{
  const rows=days.concat([{date:'invalid',exercise:'Bench Press',weight:'?',reps:3}]);
  assert.equal(core.validSets(rows).length,4);
  const future=[mk('2027-02-01T12:00:00Z','Bench Press',500,5)];
  assert.equal(core.periodData(future,8,'2026-11-01T12:00:00Z').entries.length,0);
});
