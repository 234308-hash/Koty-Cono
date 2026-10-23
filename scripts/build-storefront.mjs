// Publish only the customer-facing shop; backend/admin source never enters the site output.
import{mkdirSync,copyFileSync,cpSync}from'node:fs';import{fileURLToPath}from'node:url';import path from'node:path';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),out=path.join(root,'public-site');mkdirSync(out,{recursive:true});
for(const name of ['index.html','styles.css','cinematic.css','store.js','app.js','cinematic.js','customer-data-config.js','customer-data.js','customer-data.css'])copyFileSync(path.join(root,name),path.join(out,name));
cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});console.log('Built the storefront with a strict public-file allowlist.');
