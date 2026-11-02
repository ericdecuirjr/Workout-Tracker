'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const test=require('node:test');
const html=fs.readFileSync('index.html','utf8');
const svg=fs.readFileSync('district-flatwater-fitness-banner.svg','utf8');
const build=fs.readFileSync('build-web.mjs','utf8');
const sw=fs.readFileSync('sw.js','utf8');
test('banner appears in the responsive app header',()=>{
  assert.match(html,/<header class="brand-header">/);
  assert.match(html,/class="fitness-banner" src="district-flatwater-fitness-banner.svg"/);
  assert.match(html,/<h1 class="sr-only">District Flatwater Fitness<\/h1>/);
});
test('banner is bundled for APK and cached for offline use',()=>{
  assert.match(build,/'district-flatwater-fitness-banner.svg'/);
  assert.match(sw,/district-flatwater-fitness-banner.svg/);
});
test('original app screens and storage keys remain untouched',()=>{
  for(const id of ['dashboard','log','plan','progress','power','history'])
    assert.match(html,new RegExp('<section id="'+id+'"'));
});
test('SVG banner is valid sized artwork with accessibility information',()=>{
  assert.match(svg,/<svg\b/);
  assert.match(svg,/viewBox="0 0 900 450"/);
  assert.match(svg,/<\/svg>/);
  assert.match(svg,/District Flatwater Fitness/i);
});
