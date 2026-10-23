import {randomBytes,createHash} from 'node:crypto';
const key=randomBytes(32).toString('base64url');
console.log('Admin access key (save in your password manager):\n'+key);
console.log('\nCloudflare secret ADMIN_PASSWORD_SHA256:\n'+createHash('sha256').update(key).digest('hex'));
console.log('\nCloudflare secret SESSION_SECRET:\n'+randomBytes(48).toString('base64url'));
console.log('\nKeep these private. Never commit them or put them in frontend code. Rotating SESSION_SECRET signs out every administrator.');
