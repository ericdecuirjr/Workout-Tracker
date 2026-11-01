/* Phase 9: pure, testable workout insights. No storage or network access. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FitnessInsights = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const GROUPS = ['Chest','Back','Shoulders','Legs','Arms','Core','Conditioning','Mobility','Unmapped'];
  const TARGETS = {
    strength: [4,6], muscle: [8,12], power: [3,5], general: [8,10], endurance: [12,15]
  };
  function localDay(date) {
    const d = new Date(date);
    if (!Number.isFinite(d.getTime())) return '';
    return String(d.getFullYear())+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function validSets(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.filter(s => s && typeof s.exercise === 'string' && s.exercise.trim() &&
      Number.isFinite(Number(s.weight)) && Number(s.weight)>=0 &&
      Number.isInteger(Number(s.reps)) && Number(s.reps)>=1 &&
      Number.isFinite(new Date(s.date).getTime()));
  }
  function primaryGroup(name, overrides) {
    if (overrides && Object.prototype.hasOwnProperty.call(overrides,name) && GROUPS.includes(overrides[name])) return overrides[name];
    const s=String(name || '').toLowerCase().trim();
    if (/stretch|mobility|thoracic rotation|hip flexor|foam roll/.test(s)) return 'Mobility';
    if (/wood chop|plank|crunch|abdominal|leg raise|knee raise|sit.up|dead bug|pallof|russian twist/.test(s)) return 'Core';
    if (/cardio|burpee|walk|run|bike|cycle|conditioning|rower|jump rope|sprint/.test(s)) return 'Conditioning';
    if (/shoulder|overhead press|push press|lateral raise|reverse fly|rear delt|face pull|upright row|clean and press/.test(s)) return 'Shoulders';
    if (/triceps|biceps|hammer curl|cable curl|preacher curl|skull crusher|dip|extension|pushdown/.test(s)) return 'Arms';
    if (/pull.up|chin.up|lat pulldown|pulldown|dumbbell row|cable row|bent.over row|seated row|back extension/.test(s)) return 'Back';
    if (/bench|chest|push.up|pushup|pec|fly|dumbbell press/.test(s)) return 'Chest';
    if (/squat|deadlift|lunge|split squat|step.up|stepup|calf|hip thrust|glute|hamstring|leg press|leg curl|leg extension|bound|kettlebell swing|swing/.test(s)) return 'Legs';
    return 'Unmapped';
  }
  function monday(d) {
    const t=new Date(d.getFullYear(),d.getMonth(),d.getDate());
    t.setDate(t.getDate()-(t.getDay()+6)%7);
    return t;
  }
  function periodData(raw, weeks, now) {
    const date=now ? new Date(now) : new Date();
    const count=[4,8,12].includes(Number(weeks))?Number(weeks):8;
    const from=monday(date);from.setDate(from.getDate()-(count-1)*7);
    const entries=validSets(raw).filter(s=>{
      const time=new Date(s.date);
      return time>=from && time<=date;
    });
    return {weeks:count, entries, days:new Set(entries.map(s=>localDay(s.date))).size, from};
  }
  function muscleSummary(raw, weeks, overrides, now) {
    const period=periodData(raw,weeks,now);
    const groups=Object.fromEntries(GROUPS.map(group=>[group,{name:group,sets:0,volume:0}]));
    for (const s of period.entries) {
      const group=primaryGroup(s.exercise,overrides);
      groups[group].sets++;
      groups[group].volume+=Number(s.weight)*Number(s.reps);
    }
    return {period, groups:GROUPS.map(name=>groups[name]), totalSets:period.entries.length};
  }
  function isPowerMovement(name) {
    return /jump|bound|plyo|explosive|swing|snatch|clean|throw|sprint|push press/i.test(String(name||''));
  }
  function isStandard(s) {
    return !/^\s*\[(?:drop set|superset)\]/i.test(String(s.notes||''));
  }
  function progression(raw, name, goal, increment, now) {
    const target=TARGETS[goal]||TARGETS.muscle;
    const step=[2.5,5,10].includes(Number(increment))?Number(increment):5;
    const today=localDay(now || new Date());
    if (!name) return {kind:'empty',message:'Choose an exercise to see a recommendation.',weight:null,reps:null};
    const entries=validSets(raw).filter(s=>s.exercise===name && isStandard(s) &&
      Number(s.reps)<=30 && new Date(s.date)<=new Date(now||Date.now()) &&
      localDay(s.date)!==today);
    const byDay=new Map();
    for (const s of entries) {
      const day=localDay(s.date);
      if (!byDay.has(day))byDay.set(day,[]);
      byDay.get(day).push(s);
    }
    const days=[...byDay.keys()].sort().reverse();
    if (!days.length) return {kind:'new',message:'Log your first session for this exercise. Recommendations use previous completed days, not today’s sets.',weight:null,reps:null};
    const latest=byDay.get(days[0]),last=latest[latest.length-1];
    const currentWeight=Number(last.weight);
    const primary=latest.filter(s=>Number(s.weight)===currentWeight);
    const minReps=Math.min(...primary.map(s=>Number(s.reps)));
    if (isPowerMovement(name)) {
      return {kind:'power',message:'Power exercise: prioritize speed and precise technique. Keep the load manageable; stop explosive sets when speed drops.',weight:currentWeight,reps:Number(last.reps)};
    }
    if (currentWeight===0) {
      const next=Math.min(target[1],Math.max(1,minReps+1));
      return {kind:'bodyweight',message:'Bodyweight set: aim for '+next+' controlled reps if last time felt comfortable. Do not add load automatically.',weight:0,reps:next};
    }
    const previous=days.length>1?byDay.get(days[1]):null;
    const sameLoadTwoDays=previous && previous.length>=2 && latest.length>=2 &&
      latest.every(s=>Number(s.weight)===currentWeight) &&
      previous.every(s=>Number(s.weight)===currentWeight);
    const ready=sameLoadTwoDays &&
      latest.every(s=>Number(s.reps)>=target[1]) &&
      previous.every(s=>Number(s.reps)>=target[1]);
    if (ready) {
      const weight=Math.round((currentWeight+step)*2)/2;
      return {kind:'increase',message:'Two completed sessions reached '+target[1]+' reps at '+currentWeight+' lb. Consider '+weight+' lb × '+target[0]+' reps, only if the sets felt controlled and recovery is good.',weight,reps:target[0]};
    }
    if (minReps<target[0]) {
      return {kind:'hold',message:'Repeat '+currentWeight+' lb and work toward '+target[0]+' clean reps before increasing weight. Reduce load if form breaks down.',weight:currentWeight,reps:minReps};
    }
    const next=Math.min(target[1],minReps+1);
    return {kind:'reps',message:'Stay at '+currentWeight+' lb and target '+next+' good reps. Consider more weight only after two consistent full sessions at '+target[1]+' reps.',weight:currentWeight,reps:next};
  }
  return {GROUPS,TARGETS,localDay,validSets,primaryGroup,periodData,muscleSummary,progression,isPowerMovement};
});
