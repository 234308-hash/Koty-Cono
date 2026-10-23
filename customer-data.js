(()=>{
'use strict';
const config=window.KOTY_DATA_CONFIG||{},S=window.KotyStore;
if(!config.enabled||!config.apiBase||!S)return;
let base;try{base=new URL(config.apiBase);if(base.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(base.hostname))return}catch{return}
base=base.href.replace(/\/$/,'');
const key='koty-research-privacy-v1',sk='koty-analytics-session-v1';let choice=null;
try{choice=JSON.parse(localStorage.getItem(key))}catch{}
let session=null,pendingRevoke=null;
const uuid=()=>crypto.randomUUID();
function currentSession(){if(session)return session;try{session=sessionStorage.getItem(sk);if(!session){session=uuid();sessionStorage.setItem(sk,session)}}catch{session=uuid()}return session}
function a(){const p=new URL(location.href).searchParams;const clean=(v,n)=>String(v||'').replace(/[\r\n<>]/g,'').slice(0,n);let source=p.get('utm_source');if(!source&&document.referrer){try{const h=new URL(document.referrer).hostname;if(h!==location.hostname)source=h.replace(/^www\./,'')}catch{}}return {source:clean(source||'direct',80),medium:clean(p.get('utm_medium')||'none',80),campaign:clean(p.get('utm_campaign'),100)}}
let attribution=null;
async function post(path,data){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);try{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});const b=await r.json();if(!r.ok)throw Error(b.error||'Could not save. Please try again.');return b}finally{clearTimeout(timer)}}
function analytics(){return choice?.analytics===true}
function track(type,product){if(!analytics())return;attribution??=a();post('/api/events',{id:uuid(),sessionId:currentSession(),analyticsConsent:true,type,product:product||null,...attribution}).catch(()=>{});}
const banner=document.createElement('aside');banner.className='kc-privacy';banner.setAttribute('aria-label','Optional site analytics');banner.innerHTML='<p><strong>Your choices, your data.</strong><br>Allow optional activity measurement to help us improve flavours and shopping? This uses a random session reference. Your bag works either way. <button type="button" data-policy="privacy" style="text-decoration:underline">Read our privacy note</button></p><div class="kc-actions"><button type="button" data-choice="no">Essential only</button><button type="button" class="kc-accept" data-choice="yes">Allow analytics</button></div><p id="kc-privacy-status" role="status" style="margin-top:10px"></p>';
document.body.append(banner);banner.hidden=choice!==null;
async function choose(allow){const old=analytics();choice={analytics:allow,version:'2026-10-23-v1'};try{localStorage.setItem(key,JSON.stringify(choice))}catch{}if(allow){banner.hidden=true;if(!old)track('page_view');return}
 if(old&&!pendingRevoke)pendingRevoke=currentSession();session=null;attribution=null;try{sessionStorage.removeItem(sk)}catch{}
 if(pendingRevoke){try{await post('/api/analytics/revoke',{sessionId:pendingRevoke});pendingRevoke=null;banner.hidden=true}catch{document.getElementById('kc-privacy-status').textContent='Analytics stopped on this browser. Earlier activity could not be removed yet; choose Essential only again to retry.';banner.hidden=false}}else banner.hidden=true;
}
banner.addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(b)choose(b.dataset.choice==='yes')});
document.querySelector('[data-manage-data]')?.addEventListener('click',()=>{banner.hidden=false;banner.querySelector('button').focus()});
if(analytics())track('page_view');
document.addEventListener('koty:added',e=>track('add_to_cart',e.detail?.id));
document.addEventListener('koty:productview',e=>track('product_view',e.detail?.id));
document.addEventListener('click',e=>{const b=e.target.closest('[data-flavor]');if(b)track('product_view',b.dataset.flavor)});
document.addEventListener('koty:productsaved',e=>track('product_saved',e.detail?.id));
document.addEventListener('koty:checkoutstart',()=>track('checkout_start'));
document.addEventListener('koty:checkoutcomplete',()=>track('checkout_complete'));
const form=document.getElementById('kc-feedback-form');
if(form){form.addEventListener('submit',async e=>{e.preventDefault();const b=form.querySelector('button[type="submit"]'),status=form.querySelector('[role="status"]'),data=Object.fromEntries(new FormData(form));if(!data.consent){status.textContent='Please accept research storage to share feedback.';return}b.disabled=true;status.className='';status.textContent='Saving your feedback…';const id=form.dataset.requestId||(form.dataset.requestId=uuid());try{await post('/api/feedback',{id,product:data.product,rating:Number(data.rating),comment:data.comment,consent:true});form.reset();delete form.dataset.requestId;status.className='kc-success';status.textContent='Thank you. Your feedback has been saved. Reference: '+id}catch(err){status.className='kc-error';status.textContent=err.name==='AbortError'?'Saving timed out. Please try again.':err.message}finally{b.disabled=false}});form.addEventListener('input',()=>delete form.dataset.requestId)}
window.KotyCustomerData={enabled:true,async saveDemoOrder(order,{marketingConsent=false,id}={}){const payload={id:id||uuid(),customer:{name:order.customer.name,phone:order.customer.phone,email:order.customer.email,city:order.customer.city},items:order.items.map(({id,size,topping,qty})=>({id,size,topping,qty})),coupon:order.totals.discount?'KOTY10':'',payment:order.payment,demo:true,researchConsent:true,marketingConsent,analyticsConsent:analytics(),...(analytics()?{sessionId:currentSession(),...(attribution??=a())}:{})};return post('/api/orders',payload)},track};
document.querySelectorAll('[data-cloud-only]').forEach(el=>el.hidden=false);
})();
