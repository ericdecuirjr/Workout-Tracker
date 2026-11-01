'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const build=fs.readFileSync('build-web.mjs','utf8');
const nav=fs.readFileSync('phase9-nav.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pull=(pattern)=>[...html.matchAll(pattern)].map(x=>x[1]);
test('Five primary navigation destinations including More',()=>{
  const section=html.match(/<nav aria-label="Main navigation" class="main-nav">([\s\S]*?)<\/nav>/);
  assert.ok(section);
  const ids=[...section[1].matchAll(/data-tab="([^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(ids,['dashboard','log','plan','progress']);
  assert.match(section[1],/id="moreToggle"/);
  assert.match(html,/id="moreMenu"[^>]*hidden/);
});
test('Secondary destinations still have native data-tab buttons',()=>{
  for(const tab of ['power','history'])assert.match(html,new RegExp('data-tab="'+tab+'"'));
  for(const id of ['dashboard','plan','power','log','history','progress'])assert.match(html,new RegExp('<section id="'+id+'"'));
});
test('Quick links land at existing feature IDs',()=>{
  const ids=new Set(pull(/\bid="([^"]+)"/g));
  assert.equal(ids.size,pull(/\bid="([^"]+)"/g).length);
  const targets=pull(/data-(?:target|jump-to)="([^"]+)"/g);
  for(const id of targets)assert.ok(ids.has(id),'Missing target: '+id);
});
test('All collapsible feature cards are balanced and available',()=>{
  assert.equal((html.match(/<details\b/g)||[]).length,(html.match(/<\/details>/g)||[]).length);
  for(const id of ['planEditorCard','coachCard','aiCustomizerCard','progressionCard','muscleAnalysisCard','strengthAnalysisCard','exerciseChartCard'])
    assert.match(html,new RegExp('<details id="'+id+'"'));
});
test('Bundled app and offline cache include the navigation controller',()=>{
  assert.match(build,/'phase9-nav\.js'/);
  assert.match(html,/phase9-nav\.js\?v=9nav/);
  assert.match(sw,/phase9-nav\.js\?v=9nav/);
  assert.match(nav,/updateNav/);
});
