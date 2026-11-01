import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { build } from 'esbuild';

const out='www';
mkdirSync(out,{recursive:true});
const assets=['index.html','app.js','phase8.js','phase9-core.js','phase9.js','phase9-nav.js','style.css','sw.js','manifest.webmanifest','icon-192.png','icon-512.png'];
for(const f of assets){
  if(!existsSync(f))throw Error('Missing app file: '+f);
  cpSync(f,`${out}/${f}`);
}
await build({
  entryPoints:['native-bridge.mjs'],
  bundle:true,
  platform:'browser',
  format:'iife',
  target:'es2020',
  minify:true,
  outfile:`${out}/native-bridge.js`
});
console.log('Capacitor web bundle created in '+out);
