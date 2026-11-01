// Phase 8: additive analytics and ChatGPT-assisted plan import.
// Relies on the existing app.js shared state and never changes stored set/plan formats.
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const formatted = n => Math.round(n).toLocaleString();
  const validSets = () => sets.filter(s =>
    s && typeof s.exercise === 'string' &&
    Number.isFinite(Number(s.weight)) && Number(s.weight) >= 0 &&
    Number.isInteger(Number(s.reps)) && Number(s.reps) > 0 &&
    !Number.isNaN(new Date(s.date).getTime())
  );
  const volume = entries => entries.reduce((sum,s) => sum + Number(s.weight) * Number(s.reps),0);
  const monday = d => startOfWeek(d);
  const dateKey = d => localDay(d);
  const shiftWeeks = (d, n) => {
    const result = new Date(d);
    result.setDate(result.getDate() + n * 7);
    return result;
  };
  const sessions = entries => new Set(entries.map(s => dateKey(s.date))).size;
  const labelDate = d => d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
  const makeStat = (label,value,detail) => {
    const node = document.createElement('div');node.className='stat insight-stat';
    const strong = document.createElement('strong');strong.textContent=value;
    const span = document.createElement('span');span.textContent=label;
    const note = document.createElement('small');note.textContent=detail;
    node.append(strong,span,note);return node;
  };
  function drawBars(canvas, values, labels) {
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);
    const left=52,right=14,top=20,bottom=52,plotW=w-left-right,plotH=h-top-bottom;
    const ceiling=Math.max(1,...values)*1.1;
    ctx.font='13px system-ui';ctx.textAlign='right';ctx.fillStyle='#607184';
    for(let tick=0;tick<=4;tick++){
      const y=top+plotH-tick*plotH/4;
      ctx.strokeStyle='#e4e9f1';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();
      ctx.fillText(formatted(ceiling*tick/4),left-8,y+4);
    }
    const cell=plotW/Math.max(1,values.length),barWidth=Math.min(46,cell*.62);
    ctx.textAlign='center';
    values.forEach((v,i)=>{
      const x=left+cell*(i+.5),height=Math.max(0,v)/ceiling*plotH;
      ctx.fillStyle='#287453';ctx.fillRect(x-barWidth/2,top+plotH-height,barWidth,height);
      ctx.fillStyle='#607184';ctx.fillText(labels[i],x,h-25);
    });
  }
  function drawLine(canvas, points, labels) {
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);
    const left=58,right=22,top=22,bottom=56,plotW=w-left-right,plotH=h-top-bottom;
    if(!points.some(v=>Number.isFinite(v))) {
      ctx.font='16px system-ui';ctx.fillStyle='#607184';
      ctx.fillText('No weighted sets of 1–12 reps for this exercise yet.',24,65);return;
    }
    const finite=points.filter(Number.isFinite),low=Math.max(0,Math.min(...finite)*.9),high=Math.max(...finite)*1.08+1;
    ctx.font='13px system-ui';ctx.textAlign='right';
    for(let tick=0;tick<=4;tick++){
      const y=top+plotH-tick*plotH/4;
      ctx.strokeStyle='#e4e9f1';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();
      ctx.fillStyle='#607184';ctx.fillText(formatted(low+(high-low)*tick/4),left-8,y+4);
    }
    const cell=plotW/Math.max(points.length-1,1);
    ctx.strokeStyle='#287453';ctx.lineWidth=3;ctx.beginPath();
    let drawing=false;
    points.forEach((v,i)=>{
      if(!Number.isFinite(v)){drawing=false;return;}
      const x=left+i*cell,y=top+plotH-(v-low)/(high-low)*plotH;
      if(drawing)ctx.lineTo(x,y);else ctx.moveTo(x,y);
      drawing=true;
    });
    ctx.stroke();
    ctx.textAlign='center';
    points.forEach((v,i)=>{
      const x=left+i*cell;
      if(Number.isFinite(v)){
        const y=top+plotH-(v-low)/(high-low)*plotH;
        ctx.fillStyle='#c39229';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle='#607184';ctx.fillText(labels[i],x,h-25);
    });
  }
  function renderAnalytics(){
    const weekCount=Number(byId('insightsWindow').value)||8;
    const start=monday(new Date()),first=shiftWeeks(start,-(weekCount-1));
    const previousStart=shiftWeeks(first,-weekCount);
    const now=new Date();
    const relevant=validSets();
    const current=relevant.filter(s=>new Date(s.date)>=first&&new Date(s.date)<=now);
    const previous=relevant.filter(s=>new Date(s.date)>=previousStart&&new Date(s.date)<first);
    const weekly=Array.from({length:weekCount},(_,i)=>{
      const from=shiftWeeks(first,i),to=shiftWeeks(from,1);
      const entries=current.filter(s=>new Date(s.date)>=from&&new Date(s.date)<to);
      return {from,entries,sets:entries.length,sessions:sessions(entries),volume:volume(entries)};
    });
    const compare = (a,b) => b>0 ? ((a-b)/b*100>=0?'+':'')+Math.round((a-b)/b*100)+'% vs previous period' : 'Previous period: '+(b===0?'no entries':formatted(b));
    const target=byId('insightsStats');target.replaceChildren(
      makeStat('Training days',String(sessions(current)),compare(sessions(current),sessions(previous))),
      makeStat('Sets logged',formatted(current.length),compare(current.length,previous.length)),
      makeStat('Weighted volume',formatted(volume(current))+' lb',compare(volume(current),volume(previous))),
      makeStat('Avg. training days/week',(sessions(current)/weekCount).toFixed(1),'Current '+weekCount+' calendar weeks')
    );
    drawBars(byId('insightsVolumeChart'),weekly.map(x=>x.volume),weekly.map(x=>labelDate(x.from)));
    const table=byId('insightsWeekRows');table.replaceChildren();
    weekly.slice().reverse().forEach(w=>{
      const tr=document.createElement('tr');
      [labelDate(w.from),String(w.sessions),String(w.sets),formatted(w.volume)+' lb'].forEach(value=>{
        const td=document.createElement('td');td.textContent=value;tr.append(td);
      });
      table.append(tr);
    });
    const select=byId('insightsExercise'),existing=select.value;
    const names=[...new Set(relevant.map(s=>s.exercise))].sort((a,b)=>a.localeCompare(b));
    select.replaceChildren();
    if(!names.length)select.add(new Option('No logged exercises',''));
    else names.forEach(name=>select.add(new Option(name,name)));
    if(names.includes(existing))select.value=existing;
    const exercise=select.value;
    const exerciseSets=relevant.filter(s=>s.exercise===exercise).sort((a,b)=>a.date.localeCompare(b.date));
    const filtered=exerciseSets.filter(s=>Number(s.weight)>0&&Number(s.reps)<=12);
    const points=weekly.map(w=>{
      const from=w.from,to=shiftWeeks(from,1);
      const matching=filtered.filter(s=>new Date(s.date)>=from&&new Date(s.date)<to);
      return matching.length?Math.max(...matching.map(s=>Number(s.weight)*(1+Number(s.reps)/30))):null;
    });
    const lineLabels=weekly.map(w=>labelDate(w.from));
    drawLine(byId('insightsStrengthChart'),points,lineLabels);
    const text=byId('insightsExerciseSummary');
    if(!exerciseSets.length)text.textContent='Choose an exercise after logging sets to see its trend.';
    else {
      const peak=Math.max(...exerciseSets.map(s=>Number(s.weight)));
      const best=filtered.length?Math.max(...filtered.map(s=>Number(s.weight)*(1+Number(s.reps)/30))):null;
      text.textContent=exerciseSets.length+' logged sets · Heaviest: '+formatted(peak)+' lb'+
        (best===null?'':' · Best estimated 1RM: '+Math.round(best)+' lb')+
        '. Estimates use Epley (1–12 reps) and are not tested maxes.';
    }
    byId('insightsSummary').textContent='Weighted volume is weight × reps (lb); bodyweight-only work entered as 0 lb is not reflected in volume. The current week may be incomplete.';
  }
  byId('insightsWindow').addEventListener('change',renderAnalytics);
  byId('insightsExercise').addEventListener('change',renderAnalytics);
  // app.js refreshes this after saves, undo, deletes and restoring backups.
  window.refreshPhase8Analytics=renderAnalytics;
  renderAnalytics();

  // No API key or personal workout history is sent from the app. The user
  // chooses what to share, and pastes ChatGPT-generated plan JSON back manually.
  const weekdaysByCount={
    2:[1,4],3:[1,3,5],4:[1,2,4,5],5:[1,2,3,4,5],6:[1,2,3,4,5,6],7:[1,2,3,4,5,6,7]
  };
  const goalLabels={
    strength:'Increase maximal strength safely',
    muscle:'Build muscle and hypertrophy',
    power:'Improve explosive power while building strength',
    general:'Build general fitness, consistency and mobility',
    endurance:'Improve muscular endurance and conditioning'
  };
  function promptText(){
    const days=Number(byId('aiDays').value)||5;
    const list=weekdaysByCount[days]||weekdaysByCount[5];
    const notes=byId('aiConsiderations').value.trim();
    return [
      'Create a customized, sustainable weekly strength and fitness plan for use in my Android workout app.',
      'Primary goal: '+(goalLabels[byId('aiGoal').value]||goalLabels.strength)+'.',
      'Training experience: '+byId('aiLevel').value+'.',
      'Workouts per week: '+days+'. Use exactly these unique weekdays (Mon=1, Sun=7): '+list.join(', ')+'.',
      'Time available per session: '+byId('aiMinutes').value+' minutes.',
      'Available equipment: '+byId('aiEquipment').value.trim()+'.',
      'Additional preferences/limitations: '+(notes||'None stated')+'.',
      'Include balanced movement patterns, warm-up guidance in the prescriptions where appropriate, safe gradual progression, recovery, and an achievable training load.',
      'For explosive work prefer low volume, excellent technique and complete recovery. Avoid all-out 1RM testing and specify safe alternatives when appropriate.',
      'Return ONLY valid JSON: a single array of '+days+' day objects, with no markdown fences and no introduction.',
      'Schema: [{"weekday":1,"type":"Custom","title":"Session name","moves":[{"name":"Exercise name","prescription":"3 × 8–10; rest 90 sec"}]}].',
      'Every day type must be exactly "Custom"; weekday must match the weekdays above; each title 80 chars max; each day has 3–10 exercises; name 100 chars max; prescription 120 chars max.',
      'Use plain exercise names and practical sets, reps, rest, and progression cues. Do not include extra JSON keys.'
    ].join('\n');
  }
  const prompt=byId('aiPrompt'),status=byId('aiStatus'),output=byId('aiResponseInput');
  let validated=null;
  function feedback(message,error){
    status.textContent=message;
    status.classList.toggle('error',!!error);
  }
  function buildPrompt(){
    prompt.value=promptText();
    feedback('Prompt ready. Copy it to ChatGPT, then paste the resulting JSON below.');
  }
  byId('aiBuildPrompt').addEventListener('click',buildPrompt);
  byId('aiCopyPrompt').addEventListener('click',async()=>{
    prompt.value=promptText();
    try{
      if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');
      await navigator.clipboard.writeText(prompt.value);
      feedback('Prompt copied. Open ChatGPT and paste it into a new conversation.');
    }catch{
      prompt.focus();prompt.select();
      try{
        if(document.execCommand('copy'))feedback('Prompt copied. Open ChatGPT and paste it.');
        else feedback('Select and copy the highlighted prompt, then open ChatGPT.');
      }catch{feedback('Select and copy the highlighted prompt, then open ChatGPT.');}
    }
  });
  byId('aiOpenChat').addEventListener('click',()=>{
    window.open('https://chatgpt.com/','_blank','noopener,noreferrer');
  });
  output.addEventListener('input',()=>{
    validated=null;byId('aiApplyPlan').disabled=true;
    byId('aiPreview').replaceChildren();
  });
  function readPlan(){
    let raw=output.value.trim();
    raw=raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
    const parsed=JSON.parse(raw);
    const data=Array.isArray(parsed)?parsed:parsed.plan;
    const cleaned=parsePlan(data);
    if(!cleaned)throw Error('Expected 1–7 unique weekdays, valid workout types and exercise arrays.');
    if(cleaned.some(d=>d.moves.length===0))throw Error('Every training day needs at least one exercise.');
    return cleaned;
  }
  byId('aiReviewPlan').addEventListener('click',()=>{
    validated=null;byId('aiApplyPlan').disabled=true;
    try{
      const proposal=readPlan(),preview=byId('aiPreview');
      preview.replaceChildren();
      proposal.forEach(day=>{
        const card=document.createElement('article');card.className='ai-preview-day';
        const title=document.createElement('strong');
        title.textContent=weekdayName(day)+' · '+dayTitle(day);
        const detail=document.createElement('p');detail.textContent=day.moves.map(m=>m.name+' ('+m.prescription+')').join('; ');
        card.append(title,detail);preview.append(card);
      });
      validated=proposal;
      byId('aiApplyPlan').disabled=false;
      feedback('Plan validated. Review the sessions, then apply to replace your custom weekly plan.');
    }catch(err){feedback('Could not preview plan: '+err.message,true);}
  });
  byId('aiApplyPlan').addEventListener('click',()=>{
    if(!validated){feedback('Preview a valid plan before applying it.',true);return;}
    if(!confirm('Replace your current custom weekly plan? Saved workout history and your power cycle will stay unchanged.'))return;
    try{
      // Commit before mutating memory; preserve localStorage plan key and backup schema.
      localStorage.setItem(planKey,JSON.stringify(validated));
      planState=JSON.parse(JSON.stringify(validated));
      draftPlan=JSON.parse(JSON.stringify(validated));
      renderEditor();renderPlan();renderWeeklySchedule();
      feedback('Custom plan saved! Your logged workouts remain intact.'+
        (powerState.active?' The power cycle is still active; choose “Use my custom weekly plan” to switch.':''));
      validated=null;byId('aiApplyPlan').disabled=true;
    }catch{feedback('Could not save this plan. Check device storage; existing plan was not replaced.',true);}
  });
  buildPrompt();
})();