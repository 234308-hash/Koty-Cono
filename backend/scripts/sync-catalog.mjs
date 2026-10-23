import {readFileSync,writeFileSync} from 'node:fs';
const store=readFileSync(new URL('../../store.js',import.meta.url),'utf8');
writeFileSync(new URL('../catalog.mjs',import.meta.url),'// Generated from the existing store.js; run scripts/sync-catalog.mjs when the menu changes.\nconst module={exports:{}};\n'+store+'\nexport default module.exports;\n');
console.log('Existing catalogue synchronised.');
