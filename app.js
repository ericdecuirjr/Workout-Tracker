const exercises=['Bench Press','Dumbbell Press','Squat','Deadlift','Dumbbell Row','Lat Pulldown','Pull-up','Overhead Press','Biceps Curl','Triceps Pushdown','Lunge','Kettlebell Swing','Push-up','Cable Row','Goblet Squat','Dumbbell Romanian Deadlift','Bulgarian Split Squat','Cable Chest Fly','Incline Dumbbell Press','Dumbbell Lateral Raise','Face Pull','Cable Lateral Raise','Cable Curl','Hammer Curl','Overhead Triceps Extension','Triceps Dip','Hanging Knee Raise','Plank','Kettlebell Goblet Squat','Kettlebell Clean and Press','Single-leg Romanian Deadlift','Calf Raise','Reverse Fly','Cable Wood Chop'];const $=id=>document.getElementById(id);const key='workout-tracker-v1';let sets=[];try{sets=JSON.parse(localStorage.getItem(key)||'[]')}catch{};if(!Array.isArray(sets))sets=[];const save=()=>localStorage.setItem(key,JSON.stringify(sets));function choices(){const all=[...new Set([...exercises,...sets.map(s=>s.exercise)])].sort();for(const id of ['exercise','chartExercise']){const old=$(id).value;$(id).innerHTML=all.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');if(all.includes(old))$(id).value=old}}function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function formLink(){const ex=$('custom').value.trim()||$('exercise').value;$('formlink').href='https://www.youtube.com/results?search_query='+encodeURIComponent(ex+' exercise proper form')}choices();formLink();$('exercise').onchange=formLink;$('custom').oninput=formLink;$('form').onsubmit=e=>{e.preventDefault();const exercise=$('custom').value.trim()||$('exercise').value;const weight=Number($('weight').value),reps=Number($('reps').value);if(!exercise||!Number.isFinite(weight)||weight<0||!Number.isInteger(reps)||reps<1)return;sets.push({id:Date.now()+Math.random(),date:new Date().toISOString(),exercise,weight,reps,notes:($('setType').value==='Standard'?'':`[${$('setType').value}] `)+$('notes').value.trim()});save();$('notes').value='';$('custom').value='';choices();formLink();alert('Set saved!')};document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));['dashboard','plan','log','history','progress'].forEach(id=>$(id).hidden=id!==b.dataset.tab);if(b.dataset.tab==='dashboard')renderDashboard();if(b.dataset.tab==='history')renderHistory();if(b.dataset.tab==='progress')draw()});function renderHistory(){$('entries').innerHTML=sets.length?'':'<p>No sets logged yet.</p>';[...sets].reverse().forEach(s=>{const a=document.createElement('article');const title=document.createElement('strong');title.textContent=s.exercise+' — '+s.weight+' lb × '+s.reps;const small=document.createElement('small');small.textContent=new Date(s.date).toLocaleString()+(s.notes?' · '+s.notes:'');const del=document.createElement('button');del.textContent='Delete';del.onclick=()=>{if(confirm('Delete this set?')){sets=sets.filter(x=>x.id!==s.id);save();renderHistory();choices()}};a.append(del,title,document.createElement('br'),small);$('entries').append(a)})}function draw(){const c=$('chart'),ctx=c.getContext('2d'),data=sets.filter(s=>s.exercise===$('chartExercise').value).sort((a,b)=>a.date.localeCompare(b.date));ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#526174';ctx.font='17px sans-serif';if(!data.length){ctx.fillText('Log sets to see your progress.',30,65);$('summary').textContent='';return}const metric=$('metric').value;const values=data.map(x=>metric==='volume'?x.weight*x.reps:metric==='estimated'?x.weight*(1+x.reps/30):x.weight);const weights=values,min=Math.min(...weights),max=Math.max(...weights),lo=Math.max(0,min-5),hi=max+5;ctx.strokeStyle='#dce3ed';for(let i=0;i<=4;i++){let y=260-i*50;ctx.beginPath();ctx.moveTo(55,y);ctx.lineTo(610,y);ctx.stroke();ctx.fillText((lo+(hi-lo)*i/4).toFixed(0),12,y+5)}ctx.strokeStyle='#2563eb';ctx.lineWidth=3;ctx.beginPath();data.forEach((s,i)=>{const x=65+(data.length===1?0:i*530/(data.length-1)),y=260-(values[i]-lo)/(hi-lo)*200;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.fillStyle='#2563eb';data.forEach((s,i)=>{const x=65+(data.length===1?0:i*530/(data.length-1)),y=260-(values[i]-lo)/(hi-lo)*200;ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill()});$('summary').textContent=data.length+' sets · Best '+metric+': '+max.toFixed(1)+' · Latest: '+values[values.length-1].toFixed(1)}$('chartExercise').onchange=draw;$('metric').onchange=draw;$('export').onclick=()=>{const rows=[['Date','Exercise','Weight (lb)','Reps','Notes'],...sets.map(s=>[s.date,s.exercise,s.weight,s.reps,s.notes])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='workout-history.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};let duration=90,remaining=90,interval=null;function clock(){const m=Math.floor(remaining/60),s=remaining%60;$('clock').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}function pause(){clearInterval(interval);interval=null}document.querySelectorAll('[data-seconds]').forEach(b=>b.onclick=()=>{pause();duration=remaining=Number(b.dataset.seconds);clock()});$('start').onclick=()=>{if(interval){pause();return}if(remaining<=0)remaining=duration;interval=setInterval(()=>{remaining--;clock();if(remaining<=0){pause();navigator.vibrate?.([250,150,250]);alert('Rest complete!')}},1000)};$('reset').onclick=()=>{pause();remaining=duration;clock()};clock();if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
function localDay(date){const d=new Date(date);return Number.isNaN(d.getTime())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function startOfWeek(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-(x.getDay()+6)%7);return x}
function renderDashboard(){
 const now=new Date(),start=startOfWeek(now),weekSets=sets.filter(s=>new Date(s.date)>=start&&new Date(s.date)<=now);
 const days=new Set(weekSets.map(s=>localDay(s.date)));
 const volume=a=>a.reduce((n,s)=>n+Number(s.weight)*Number(s.reps),0);
 const stats=[['Workouts this week',days.size],['Sets this week',weekSets.length],['Volume this week',Math.round(volume(weekSets)).toLocaleString()+' lb'],['Total logged sets',sets.length]];
 $('stats').innerHTML=stats.map(([label,value])=>`<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
 const records=new Map();
 sets.forEach(s=>{const old=records.get(s.exercise);if(!old||s.weight>old.weight||(s.weight===old.weight&&s.reps>old.reps))records.set(s.exercise,s)});
 $('records').replaceChildren();
 if(!records.size)$('records').textContent='Your personal records will appear after you log sets.';
 [...records].sort((a,b)=>a[0].localeCompare(b[0])).forEach(([name,s])=>{const row=document.createElement('div');row.className='record';const title=document.createElement('strong');title.textContent=name;const detail=document.createElement('small');detail.textContent=`${s.weight} lb × ${s.reps} reps`;row.append(title,detail);$('records').append(row)});
 const c=$('volumeChart'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
 const weeks=Array.from({length:8},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()-(7-i)*7);return d});
 const vals=weeks.map((d,i)=>{const end=new Date(d);end.setDate(end.getDate()+7);return volume(sets.filter(s=>{const t=new Date(s.date);return t>=d&&t<end}))});
 const max=Math.max(1,...vals);ctx.font='14px sans-serif';ctx.fillStyle='#526174';
 weeks.forEach((d,i)=>{const x=42+i*73,h=vals[i]/max*205;ctx.fillStyle='#2563eb';ctx.fillRect(x,245-h,42,h);ctx.fillStyle='#526174';ctx.fillText(`${d.getMonth()+1}/${d.getDate()}`,x,270)});
 if(!sets.length){ctx.fillStyle='#526174';ctx.fillText('Log sets to start tracking weekly volume.',30,35)}
}
renderDashboard();


// Phase 3: configurable weekly plan. Workout history keeps the original key.
const planKey = 'workout-tracker-plan-v3';
const weekDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const workoutTypes = ['Push','Pull','Legs','Upper','Lower','Full Body','Conditioning','Mobility','Custom'];
const templateMoves = {
  'Push': [['Incline Dumbbell Press','4 × 6–10'],['Dumbbell Press','3 × 8–12'],['Cable Chest Fly','3 × 12–15'],['Dumbbell Lateral Raise','3 × 12–20'],['Triceps Pushdown','3 × 10–15'],['Overhead Triceps Extension','2 × 12–15 · drop set last']],
  'Pull': [['Pull-up','4 × 6–10'],['Dumbbell Row','4 × 8–12'],['Cable Row','3 × 10–12'],['Face Pull','3 × 12–20'],['Biceps Curl','3 × 8–12'],['Hammer Curl','2 × 10–15 · superset']],
  'Legs': [['Goblet Squat','4 × 8–12'],['Dumbbell Romanian Deadlift','4 × 8–12'],['Bulgarian Split Squat','3 × 8–12 / leg'],['Kettlebell Swing','3 × 15–20'],['Calf Raise','4 × 12–20'],['Plank','3 × 30–60 sec']],
  'Upper': [['Dumbbell Press','3 × 6–10'],['Pull-up','3 × 6–10'],['Overhead Press','3 × 8–12'],['Cable Row','3 × 10–12'],['Cable Lateral Raise','3 × 12–15'],['Face Pull','3 × 12–15'],['Triceps Dip','2 × 8–15']],
  'Lower': [['Goblet Squat','4 × 8–12'],['Dumbbell Romanian Deadlift','3 × 8–12'],['Lunge','3 × 10 / leg'],['Calf Raise','3 × 12–20'],['Plank','3 × 30–60 sec']],
  'Full Body': [['Kettlebell Goblet Squat','3 × 10–12'],['Dumbbell Romanian Deadlift','3 × 8–12'],['Incline Dumbbell Press','3 × 8–12'],['Lat Pulldown','3 × 10–12'],['Lunge','3 × 10 / leg'],['Cable Curl','2 × 12–15 · drop set last'],['Cable Wood Chop','3 × 12 / side']],
  'Conditioning': [['Kettlebell Swing','3 × 15–20'],['Push-up','3 × 10–20'],['Lunge','3 × 10 / leg'],['Plank','3 × 30–60 sec']],
  'Mobility': [['Bodyweight Squat','2 × 10 easy'],['Hip Flexor Stretch','2 × 30 sec / side'],['Thoracic Rotation','2 × 10 / side'],['Shoulder Mobility','2 × 10 easy']],
  'Custom': []
};
const moveClone = type => templateMoves[type].map(([name,prescription]) => ({name,prescription}));
const makeDay = (weekday,type) => ({weekday,type,title:'',moves:moveClone(type)});
const defaultPlan = () => [
  makeDay(1,'Push'),makeDay(2,'Pull'),makeDay(3,'Legs'),makeDay(4,'Upper'),makeDay(5,'Full Body')
];
function parsePlan(data){
  if(!Array.isArray(data) || data.length < 1 || data.length > 7)return null;
  const weekdays=new Set(), clean=[];
  for(const day of data){
    const weekday=Number(day?.weekday);
    const type=day?.type;
    if(!Number.isInteger(weekday)||weekday<1||weekday>7||weekdays.has(weekday)||!workoutTypes.includes(type))return null;
    weekdays.add(weekday);
    const rawMoves=day.moves;
    if(!Array.isArray(rawMoves)||rawMoves.length>40)return null;
    const moves=rawMoves.map(m=>Array.isArray(m)?{name:m[0],prescription:m[1]}:m).map(m=>({
      name:String(m?.name ?? '').trim().slice(0,100),
      prescription:String(m?.prescription ?? '').trim().slice(0,120)
    })).filter(m=>m.name);
    clean.push({weekday,type,title:String(day.title ?? '').trim().slice(0,80),moves});
  }
  return clean.sort((a,b)=>a.weekday-b.weekday);
}
let planState=defaultPlan();
try { const stored=JSON.parse(localStorage.getItem(planKey)); planState=parsePlan(stored)||planState; } catch {}
let draftPlan=JSON.parse(JSON.stringify(planState));
const dayTitle = day => day.type==='Custom' ? (day.title || 'Custom') : day.type;
const weekdayName = day => weekDays[day.weekday-1];
$('daysPerWeek').innerHTML=Array.from({length:7},(_,i)=>`<option value="${i+1}">${i+1} day${i?'s':''}</option>`).join('');
function setFeedback(message,isError=false){
  $('planFeedback').textContent=message;
  $('planFeedback').classList.toggle('error',isError);
}
function textAreaToMoves(value) {
  return String(value).split(/\r?\n/).map(line=>line.trim()).filter(Boolean).slice(0,40).map(line=>{
    const sep=line.indexOf('|');
    return sep===-1
      ? {name:line.slice(0,100).trim(),prescription:''}
      : {name:line.slice(0,sep).trim().slice(0,100),prescription:line.slice(sep+1).trim().slice(0,120)};
  }).filter(m=>m.name);
}
function movesToText(moves){return moves.map(m=>m.name+(m.prescription?' | '+m.prescription:'')).join('\n');}
function collectDraftEdits(){
  $('scheduleEditor').querySelectorAll('[data-day-index]').forEach(card=>{
    const i=Number(card.dataset.dayIndex), day=draftPlan[i];
    if(!day)return;
    day.weekday=Number(card.querySelector('[data-field="weekday"]').value);
    day.type=card.querySelector('[data-field="type"]').value;
    day.title=card.querySelector('[data-field="title"]').value.trim().slice(0,80);
    day.moves=textAreaToMoves(card.querySelector('[data-field="moves"]').value);
  });
}
function renderEditor(){
  $('daysPerWeek').value=String(draftPlan.length);
  const container=$('scheduleEditor');
  container.replaceChildren();
  draftPlan.forEach((day,i)=>{
    const card=document.createElement('div');card.className='schedule-day';card.dataset.dayIndex=String(i);
    const heading=document.createElement('strong');heading.textContent=`Training day ${i+1}`;
    const grid=document.createElement('div');grid.className='grid';
    const weekdayLabel=document.createElement('label');weekdayLabel.textContent='Day of week';
    const weekdaySelect=document.createElement('select');weekdaySelect.dataset.field='weekday';
    weekDays.forEach((name,j)=>weekdaySelect.add(new Option(name,String(j+1),false,day.weekday===j+1)));
    weekdayLabel.append(weekdaySelect);
    const typeLabel=document.createElement('label');typeLabel.textContent='Workout type';
    const typeSelect=document.createElement('select');typeSelect.dataset.field='type';
    workoutTypes.forEach(type=>typeSelect.add(new Option(type,type,false,day.type===type)));
    typeLabel.append(typeSelect);grid.append(weekdayLabel,typeLabel);
    const details=document.createElement('details');
    const summary=document.createElement('summary');summary.textContent='Edit workout exercises';
    const hint=document.createElement('p');hint.className='help';hint.textContent='One exercise per line. Add sets/reps after a | symbol.';
    const titleLabel=document.createElement('label');titleLabel.textContent='Custom workout name (optional)';
    const titleInput=document.createElement('input');titleInput.dataset.field='title';titleInput.value=day.title;
    titleInput.placeholder='e.g., Strength circuit';titleInput.maxLength=80;
    titleLabel.append(titleInput);
    titleLabel.hidden=day.type!=='Custom';
    const exercisesLabel=document.createElement('label');exercisesLabel.textContent='Exercises and sets/reps';
    const movesInput=document.createElement('textarea');movesInput.dataset.field='moves';movesInput.rows=6; movesInput.value=movesToText(day.moves);
    exercisesLabel.append(movesInput);
    details.append(summary,hint,titleLabel,exercisesLabel);
    card.append(heading,grid,details);container.append(card);
  });
}
function resizeDraftPlan(n){
  collectDraftEdits();
  const used=new Set(draftPlan.map(d=>d.weekday));
  while(draftPlan.length<n){
    const free=Array.from({length:7},(_,i)=>i+1).find(d=>!used.has(d));
    const type=workoutTypes[(draftPlan.length)%7];
    draftPlan.push(makeDay(free,type));used.add(free);
  }
  if(draftPlan.length>n)draftPlan.length=n;
  renderEditor();setFeedback('Review your schedule, then tap Save weekly plan.');
}
$('daysPerWeek').addEventListener('change',()=>resizeDraftPlan(Number($('daysPerWeek').value)));
$('scheduleEditor').addEventListener('change',e=>{
  const field=e.target.dataset.field;
  if(field!=='type')return;
  const card=e.target.closest('[data-day-index]'),i=Number(card.dataset.dayIndex);
  collectDraftEdits();
  const day=draftPlan[i];
  day.type=e.target.value;
  day.title='';
  day.moves=moveClone(day.type); // Switching workout types intentionally applies that template.
  const detailsWasOpen=card.querySelector('details').open;
  renderEditor();
  $('scheduleEditor').querySelector(`[data-day-index="${i}"] details`).open=detailsWasOpen;
  setFeedback('The selected workout template has been loaded. Tap Save weekly plan to keep it.');
});
function renderWeeklySchedule(){
  const target=$('weeklySchedule');target.replaceChildren();
  const today=((new Date().getDay()+6)%7)+1;
  weekDays.forEach((name,i)=>{
    const day=planState.find(x=>x.weekday===i+1);
    const row=document.createElement('div');row.className='weekrow'+(today===i+1?' today':'');
    const left=document.createElement('strong');left.textContent=name+(today===i+1?' · Today':'');
    const right=document.createElement('span');right.textContent=day?dayTitle(day):'Rest day';
    row.append(left,right);target.append(row);
  });
}
function renderPlan(){
  const old=Number($('trainingDay').value);
  $('trainingDay').replaceChildren();
  planState.forEach((day,i)=>$('trainingDay').add(new Option(`${weekdayName(day)} · ${dayTitle(day)}`,String(i))));
  $('trainingDay').value=String(old>=0&&old<planState.length?old:0);
  const day=planState[Number($('trainingDay').value)]||planState[0];
  $('planItems').replaceChildren();
  if(!day.moves.length){const p=document.createElement('p');p.className='help';p.textContent='No exercises yet. Use “Edit workout exercises” above to add them.';$('planItems').append(p);}
  day.moves.forEach(({name,prescription})=>{
    const card=document.createElement('article');card.className='planmove';
    const heading=document.createElement('strong');heading.textContent=name;
    const reps=document.createElement('p');reps.textContent=prescription||'Log sets and reps as you go';
    const buttons=document.createElement('div');buttons.className='row';
    const log=document.createElement('button');log.type='button';log.textContent='Log this';
    log.onclick=()=>{
      const inList=[...$('exercise').options].some(x=>x.value===name);
      $('custom').value=inList?'':name;
      if(inList)$('exercise').value=name;
      formLink();document.querySelector('[data-tab="log"]').click();
    };
    const demo=document.createElement('a');demo.textContent='Form video ↗';demo.href='https://www.youtube.com/results?search_query='+encodeURIComponent(name+' exercise proper form');
    demo.target='_blank';demo.rel='noopener noreferrer';
    buttons.append(log,demo);card.append(heading,reps,buttons);$('planItems').append(card);
  });
}
$('trainingDay').addEventListener('change',renderPlan);
$('savePlan').addEventListener('click',()=>{
  collectDraftEdits();
  const cleaned=parsePlan(draftPlan);
  if(!cleaned){setFeedback('Choose a different weekday for each training day. The same weekday cannot be used twice.',true);return;}
  try{
    localStorage.setItem(planKey,JSON.stringify(cleaned));
    planState=cleaned;
    draftPlan=JSON.parse(JSON.stringify(cleaned));
    renderEditor();renderPlan();renderWeeklySchedule();
    setFeedback(`Saved! You have ${planState.length} training day${planState.length===1?'':'s'} per week.`);
  }catch(err){setFeedback('Could not save your schedule. Check available browser storage.',true);}
});
$('backup').onclick=()=>{
  const a=document.createElement('a');
  const blob=new Blob([JSON.stringify({version:3,sets,plan:planState},null,2)],{type:'application/json'});
  a.href=URL.createObjectURL(blob);a.download='workout-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
$('restore').onchange=async e=>{
  const f=e.target.files?.[0];if(!f)return;
  try{
    if(f.size>5e6)throw Error('Backup is too large');
    const obj=JSON.parse(await f.text());
    if(!Array.isArray(obj.sets)||!obj.sets.every(s=>typeof s.exercise==='string'&&Number.isFinite(Number(s.weight))&&Number.isFinite(Number(s.reps))&&typeof s.date==='string'))throw Error('Invalid workout history');
    const restoredPlan=obj.plan===undefined?null:parsePlan(obj.plan);
    if(obj.plan!==undefined&&!restoredPlan)throw Error('Invalid weekly plan');
    const label=restoredPlan?'workout history and weekly plan':'workout history';
    if(!confirm(`Replace current ${label} with this backup?`))return;
    localStorage.setItem(key,JSON.stringify(obj.sets));
    if(restoredPlan)localStorage.setItem(planKey,JSON.stringify(restoredPlan));
    sets=obj.sets;
    if(restoredPlan){planState=restoredPlan;draftPlan=JSON.parse(JSON.stringify(planState));renderEditor();renderPlan();renderWeeklySchedule();}
    choices();renderHistory();renderDashboard();
    alert('Backup restored.');
  }catch(err){alert('Could not restore backup: '+err.message);}
  finally{e.target.value='';}
};
renderEditor();
renderPlan();
renderWeeklySchedule();
