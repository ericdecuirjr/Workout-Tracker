/* Phase 9 interface. Uses existing Phase 8 UI, app.js globals and pure FitnessInsights. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const I = window.FitnessInsights;
  if (!I) return;
  const settingsKey='district-flatwater-phase9-settings-v1';
  const defaultSettings={goal:'muscle',increase:5,mappings:{}};
  let preferences={...defaultSettings};
  try {
    const stored=JSON.parse(localStorage.getItem(settingsKey)||'{}');
    if (stored && typeof stored==='object') {
      if (Object.prototype.hasOwnProperty.call(I.TARGETS,stored.goal)) preferences.goal=stored.goal;
      if ([2.5,5,10].includes(Number(stored.increase))) preferences.increase=Number(stored.increase);
      if (stored.mappings && typeof stored.mappings==='object' && !Array.isArray(stored.mappings)) {
        preferences.mappings={};
        Object.entries(stored.mappings).slice(0,300).forEach(([name,group])=>{
          if (name.length<=100 && I.GROUPS.includes(group)) preferences.mappings[name]=group;
        });
      }
    }
  } catch {}
  const saveSettings=()=>{
    try {localStorage.setItem(settingsKey,JSON.stringify(preferences));return true;}
    catch {return false;}
  };
  const feedback=(id,message,error=false)=>{
    const el=$(id);if(!el)return;
    el.textContent=message;el.classList.toggle('error',error);
  };
  const format=n=>Math.round(n).toLocaleString();
  const element=(tag,cls,txt)=>{
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(txt!==undefined)el.textContent=txt;
    return el;
  };
  const currentExercise=()=>($('custom').value.trim()||$('exercise').value);
  const goalNames={strength:'Strength',muscle:'Muscle growth',power:'Explosive power',general:'General fitness',endurance:'Endurance'};
  $('progressionGoal').value=preferences.goal;
  $('progressionIncrement').value=String(preferences.increase);
  function renderProgression(){
    const name=currentExercise();
    const result=I.progression(sets,name,preferences.goal,preferences.increase);
    const message=$('progressionMessage');
    message.textContent=result.message;
    $('progressionRecommendation').textContent=result.weight!==null
      ? 'Suggested next set: '+result.weight+' lb × '+result.reps+' reps'
      : 'No suggested load yet';
    $('progressionApply').disabled=result.weight===null;
    $('progressionApply').dataset.weight=result.weight===null?'':String(result.weight);
    $('progressionApply').dataset.reps=result.reps===null?'':String(result.reps);
    const kind=I.primaryGroup(name,preferences.mappings);
    $('progressionMuscleLabel').textContent='Primary group: '+kind+(kind==='Unmapped'?' (assign in Trends)':'');
  }
  $('progressionGoal').addEventListener('change',()=>{
    preferences.goal=$('progressionGoal').value;
    if(saveSettings()) feedback('progressionFeedback','Progression goal saved.');
    else feedback('progressionFeedback','Suggestion updated, but the goal could not be saved.',true);
    if($('aiGoal'))$('aiGoal').value=preferences.goal;
    renderProgression();refreshCoachPrompt();
  });
  $('progressionIncrement').addEventListener('change',()=>{
    preferences.increase=Number($('progressionIncrement').value);
    if(saveSettings())feedback('progressionFeedback','Weight step saved.');
    else feedback('progressionFeedback','Weight step updated but could not be saved.',true);
    renderProgression();
  });
  $('progressionApply').addEventListener('click',()=>{
    const weight=Number($('progressionApply').dataset.weight),reps=Number($('progressionApply').dataset.reps);
    if($('progressionApply').disabled || !Number.isFinite(weight) || !Number.isInteger(reps) || reps<=0)return;
    $('weight').value=String(weight);$('reps').value=String(reps);
    feedback('progressionFeedback','Suggested values filled in. Review your form and readiness, then save the set yourself.');
  });
  ['change','input'].forEach(event=>{
    $('exercise').addEventListener(event,renderProgression);
    $('custom').addEventListener(event,renderProgression);
  });
  // Track other quick-log controls without changing their behavior.
  $('useLastSet').addEventListener('click',renderProgression);
  $('repeatLastSet').addEventListener('click',renderProgression);

  $('muscleWindow').value=$('insightsWindow').value;
  const muscleGroups=I.GROUPS.filter(g=>g!=='Unmapped');
  function assignableExercises(){
    return [...new Set(I.validSets(sets).map(s=>s.exercise))].sort((a,b)=>a.localeCompare(b));
  }
  function renderMuscleMapping(){
    const select=$('muscleExercise'),selected=select.value;
    const names=assignableExercises();
    select.replaceChildren();
    if(!names.length)select.add(new Option('No logged exercises',''));
    else names.forEach(n=>select.add(new Option(n,n)));
    select.value=names.includes(selected)?selected:names[0]||'';
    $('muscleGroupOverride').value=I.primaryGroup(select.value,preferences.mappings);
  }
  function renderMuscleAnalytics(){
    const weeks=Number($('muscleWindow').value);
    const summary=I.muscleSummary(sets,weeks,preferences.mappings);
    $('muscleSummary').textContent=summary.totalSets
      ? summary.totalSets+' logged sets across '+summary.period.days+' training days. Group totals count each set once.'
      : 'No sets recorded in this period yet.';
    const list=$('muscleBars');list.replaceChildren();
    const max=Math.max(1,...summary.groups.filter(g=>g.name!=='Unmapped').map(g=>g.sets));
    summary.groups.forEach(g=>{
      const outer=element('div','muscle-row');
      const top=element('div','muscle-row-label');
      top.append(element('strong','',g.name),element('span','',g.sets+' sets · '+format(g.volume)+' lb'));
      const track=element('div','muscle-track'),fill=element('div','muscle-fill');
      fill.style.width=(g.sets/max*100)+'%';
      track.append(fill);outer.append(top,track);list.append(outer);
    });
    const mapped=summary.groups.filter(g=>g.name!=='Unmapped');
    const active=mapped.filter(g=>g.sets>0).sort((a,b)=>a.sets-b.sets);
    const notes=[];
    if(summary.groups.find(g=>g.name==='Unmapped').sets>0)notes.push('Some custom exercises are unmapped; classify them below for more accurate totals.');
    if(active.length>=2 && active[active.length-1].sets>=3*active[0].sets)
      notes.push('Set counts vary significantly by muscle group. Check your plan before treating this as an imbalance.');
    if(summary.totalSets===0)notes.push('Log workouts to build your muscle-group profile.');
    if(!notes.length)notes.push('These totals describe logged primary muscle groups only, not total stimulus or recovery.');
    $('muscleInsight').textContent=notes.join(' ');
    renderMuscleMapping();
  }
  $('muscleWindow').addEventListener('change',renderMuscleAnalytics);
  $('muscleExercise').addEventListener('change',()=>{
    $('muscleGroupOverride').value=I.primaryGroup($('muscleExercise').value,preferences.mappings);
  });
  $('muscleSaveGroup').addEventListener('click',()=>{
    const name=$('muscleExercise').value,group=$('muscleGroupOverride').value;
    if(!name || !I.GROUPS.includes(group))return;
    preferences.mappings[name]=group;
    const saved=saveSettings();
    renderMuscleAnalytics();renderProgression();
    feedback('muscleFeedback',saved?'Primary group mapping saved.':'Mapping updated for this session, but storage is unavailable.',!saved);
  });
  $('muscleClearGroup').addEventListener('click',()=>{
    const name=$('muscleExercise').value;if(!name)return;
    delete preferences.mappings[name];
    const saved=saveSettings();
    renderMuscleAnalytics();renderProgression();
    feedback('muscleFeedback',saved?'Using automatic mapping again.':'Mapping reset, but storage is unavailable.',!saved);
  });

  function coachingPrompt(){
    const goal=$('aiGoal').value || preferences.goal;
    const days=$('aiDays').value,minutes=$('aiMinutes').value;
    const equipment=$('aiEquipment').value.trim();
    const limitations=$('aiConsiderations').value.trim();
    const lines=[
      'Act as a pragmatic strength and conditioning coach reviewing my weekly workout plan.',
      'Primary goal: '+(goalNames[goal]||goalNames.muscle)+'.',
      'Experience: '+$('aiLevel').value+'. Training schedule: '+days+' days/week, '+minutes+' minutes/session.',
      'Available equipment: '+(equipment||'Not specified')+'.',
      'Preferences or limitations: '+(limitations||'None stated')+'.',
      'Focus on progressive overload, movement-pattern balance, appropriate recovery, and quality technique.',
      'For explosive lifts avoid training to failure, maximal loading, or excessive jump volume.',
      'Offer 3 concise observations, practical next-set targets where justified, and a safer alternative for movements where progression is uncertain.',
      'After your analysis, optionally provide a complete revised weekly plan as ONLY a JSON array in a separate fenced code block.',
      'Revised plan schema: [{"weekday":1,"type":"Custom","title":"Session name","moves":[{"name":"Exercise","prescription":"3 × 8–10; rest 90 sec"}]}].',
      'Each day uses a unique weekday 1=Mon through 7=Sun, a valid app type ("Custom"), and 1–40 named exercises. Keep descriptions short.',
      'Do not assume information absent from this prompt. This is guidance, not a substitute for an individualized medical assessment.'
    ];
    if($('coachIncludeSummary').checked){
      const summary=I.muscleSummary(sets,Number($('muscleWindow').value),preferences.mappings);
      const now=new Date();
      const previous=new Date(now);previous.setDate(previous.getDate()-56);
      const last=I.validSets(sets).filter(s=>new Date(s.date)>=previous && new Date(s.date)<=now);
      const names=[...new Set(last.map(s=>s.exercise))].sort();
      lines.push('I explicitly choose to share this aggregate workout summary (no set dates or notes):');
      lines.push('Last 8 weeks: '+last.length+' logged sets across '+new Set(last.map(s=>I.localDay(s.date))).size+' days.');
      lines.push('Primary muscle group set counts ('+summary.period.weeks+' weeks): '+summary.groups.map(g=>g.name+'='+g.sets).join(', ')+'.');
      lines.push('Exercise names recently logged: '+(names.join('; ').slice(0,1400)||'None')+'.');
      if($('coachIncludeLoads').checked){
        const subset=names.slice(0,15).map(name=>{
          const p=I.progression(sets,name,goal,preferences.increase);
          return name+': '+p.message;
        });
        lines.push('Recent exercise progression suggestions (model-based, not coaching diagnoses): '+subset.join(' | ').slice(0,3500));
      }
    } else {
      lines.push('No workout history is supplied. Ask clarifying questions before interpreting individual progress.');
    }
    return lines.join('\n');
  }
  function refreshCoachPrompt() {
    const target=$('coachPrompt');
    if(target.dataset.generated==='true')target.value=coachingPrompt();
  }
  function makeCoachPrompt(){
    const target=$('coachPrompt');target.value=coachingPrompt();
    target.dataset.generated='true';
    feedback('coachFeedback','Review the text before copying. Nothing is transmitted automatically.');
  }
  $('coachGenerate').addEventListener('click',makeCoachPrompt);
  ['coachIncludeSummary','coachIncludeLoads'].forEach(id=>$(id).addEventListener('change',()=>{
    if(id==='coachIncludeSummary' && !$('coachIncludeSummary').checked){
      $('coachIncludeLoads').checked=false;
      $('coachIncludeLoads').disabled=true;
    } else $('coachIncludeLoads').disabled=!$('coachIncludeSummary').checked;
    makeCoachPrompt();
  }));
  ['aiGoal','aiDays','aiMinutes','aiLevel','aiEquipment','aiConsiderations'].forEach(id=>{
    $(id).addEventListener('change',refreshCoachPrompt);
  });
  $('coachCopy').addEventListener('click',async()=>{
    makeCoachPrompt();
    try {
      if(!navigator.clipboard?.writeText)throw Error('Clipboard not available');
      await navigator.clipboard.writeText($('coachPrompt').value);
      feedback('coachFeedback','Coaching prompt copied. Open ChatGPT and paste it to get recommendations.');
    }catch{
      $('coachPrompt').focus();$('coachPrompt').select();
      try {
        if(document.execCommand('copy'))feedback('coachFeedback','Coaching prompt copied.');
        else feedback('coachFeedback','Copy the selected text manually, then open ChatGPT.');
      } catch {feedback('coachFeedback','Copy the selected text manually, then open ChatGPT.');}
    }
  });
  $('coachOpenChat').addEventListener('click',()=>window.open('https://chatgpt.com/','_blank','noopener,noreferrer'));
  $('coachGoToImport').addEventListener('click',()=>{
    document.querySelector('[data-tab="plan"]').click();
    $('aiResponseInput').focus();
    $('aiResponseInput').scrollIntoView({block:'center',behavior:'smooth'});
    feedback('coachFeedback','Paste the JSON plan into the existing ChatGPT import box and preview before saving.');
  });

  const original=window.refreshPhase8Analytics;
  window.refreshPhase8Analytics=function(){
    if (typeof original==='function') original();
    renderProgression();renderMuscleAnalytics();
  };
  document.querySelector('[data-tab="progress"]').addEventListener('click',renderMuscleAnalytics);
  document.querySelector('[data-tab="log"]').addEventListener('click',renderProgression);
  renderProgression();renderMuscleAnalytics();makeCoachPrompt();
})();
