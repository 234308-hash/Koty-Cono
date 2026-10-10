(()=>{
'use strict';
const S=window.KotyStore,$=selector=>document.querySelector(selector),$$=selector=>[...document.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=cents=>'EGP '+(cents/100).toLocaleString('en-EG',{minimumFractionDigits:cents%100?2:0,maximumFractionDigits:2});
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{toast('Your browser could not save this session. Your bag still works here.')}}
let cart=S.normalize(read('koty-cart-v1',[]));
let saved=read('koty-wishlist-v1',[]);if(!Array.isArray(saved))saved=[];
let wishlist=new Set(saved.filter(id=>S.find(id)));
let coupon=read('koty-coupon-v1','')==='KOTY10'?'KOTY10':'';
let filter='all',query='',sort='featured',savedOnly=false,detailId=null,detailQty=1,toastTimer;

function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),2800)}
function openDialog(id){const d=document.getElementById(id);if(!d.open)d.showModal();document.body.style.overflow='hidden';}
function closeDialog(id){document.getElementById(id).close()}
$$('dialog').forEach(d=>{
 d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow='';});
 d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-close]');if(b)closeDialog(b.dataset.close)});

function imageMarkup(p,alt=p.name){
 if(p.image2)return `<div class="bundle-picture"><img src="assets/${p.image}.webp" alt="${esc(alt)}: first flavor" loading="lazy"><img src="assets/${p.image2}.webp" alt="${esc(alt)}: second flavor" loading="lazy"></div>`;
 return `<img src="assets/${p.image}.webp" alt="${esc(alt)}" loading="lazy">`;
}
const heart='<svg viewBox="0 0 24 24"><path d="M12 20s-9-5.7-9-11.4C3 3.3 9.6 2 12 7c2.4-5 9-3.7 9 1.6C21 14.3 12 20 12 20Z"/></svg>';
function renderCatalog(){
 let list=S.products.filter(p=>(filter==='all'||p.category===filter)&&(!savedOnly||wishlist.has(p.id))&&(p.name+' '+p.description+' '+p.category).toLowerCase().includes(query));
 if(sort==='price-low')list.sort((a,b)=>a.price-b.price);
 if(sort==='price-high')list.sort((a,b)=>b.price-a.price);
 if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
 $('#catalog-state').textContent=savedOnly?`${list.length} saved flavor${list.length===1?'':'s'} · tap the heart in the header to return to all flavors`:query?`${list.length} flavor${list.length===1?'':'s'} found`:'';
 $('#product-grid').innerHTML=list.length?list.map(p=>`<article class="product-card"><button class="product-image-button" data-detail="${p.id}" aria-label="View ${esc(p.name)} details">${imageMarkup(p)}</button><div class="product-badges"><span>LOW FAT</span>${p.id==='vanilla'?'<span class="pink">THE ORIGINAL</span>':p.category==='bundles'?'<span class="pink">MADE TO SHARE</span>':''}</div><button class="favorite ${wishlist.has(p.id)?'saved':''}" data-wish="${p.id}" aria-label="${wishlist.has(p.id)?'Unsave':'Save'} ${esc(p.name)}" aria-pressed="${wishlist.has(p.id)}">${heart}</button><div class="product-meta"><span class="dot"></span>${esc(p.tag)}</div><button class="product-title" data-detail="${p.id}">${esc(p.name)}</button><p class="product-description">${esc(p.description)}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="Add ${esc(p.name)} to your bag">+</button></div></article>`).join(''):`<div class="empty-catalog"><h3>No little treats here… yet.</h3><p>${savedOnly?'Tap a heart on a flavor to save it here.':'Try another flavor name or clear your filters.'}</p><button class="button primary" id="reset-filters">See all flavors ↗</button></div>`;
 $('#wish-count').textContent=wishlist.size;$('#wish-count').hidden=!wishlist.size;
 $('#wishlist-toggle').setAttribute('aria-pressed',savedOnly);
}
function persistCart(){save('koty-cart-v1',cart);save('koty-coupon-v1',coupon);renderCart();renderCheckoutSummary()}
function addItem(id,options){const before=S.calculate(cart).count;cart=S.add(cart,id,options);persistCart();if(S.calculate(cart).count===before)toast('A little limit: 10 of each flavor combination.');else toast(`${S.find(id).name} is in your happy little bag.`)}
function totalMarkup(t){return `<div class="total-row muted"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>${t.discount?`<div class="total-row discount"><span>KOTY10 · 10% off</span><span>−${money(t.discount)}</span></div>`:''}<div class="total-row muted"><span>Delivery${t.delivery?'':' · on us'}</span><span>${t.delivery?money(t.delivery):'Free'}</span></div><div class="total-row total"><span>Total</span><span>${money(t.total)}</span></div>`}
function itemOptions(line){const p=S.find(line.id);return p.category==='bundles'?'Sharing box · as pictured':`${S.sizes[line.size].label} · ${S.toppings[line.topping].label}`}
function renderCart(){
 const t=S.calculate(cart,{coupon});$('#cart-count').textContent=t.count;$('#drawer-count').textContent=`(${t.count})`;
 $('#cart-bottom').hidden=!cart.length;
 $('#cart-items').innerHTML=cart.length?cart.map(line=>{const p=S.find(line.id);return `<div class="cart-row"><img src="assets/${p.image}.webp" alt="${esc(p.name)}"><div><div class="cart-row-title"><h3>${esc(p.name)}</h3><strong>${money(S.unitPrice(line)*line.qty)}</strong></div><p class="cart-options">${esc(itemOptions(line))}</p><div class="cart-controls"><div class="quantity"><button data-qty="${esc(line.key)}" data-delta="-1" aria-label="Decrease ${esc(p.name)} quantity">−</button><span>${line.qty}</span><button data-qty="${esc(line.key)}" data-delta="1" aria-label="Increase ${esc(p.name)} quantity" ${line.qty>=10?'disabled':''}>+</button></div><button class="remove" data-remove="${esc(line.key)}" aria-label="Remove ${esc(p.name)}">Remove</button></div></div></div>`}).join(''):`<div class="cart-empty"><span class="empty-icon">✦</span><h3>A little room for joy.</h3><p>Your bag is empty. Let's find you<br>something creamy and dreamy.</p><button class="button primary" id="empty-shop">Explore the flavors ↗</button></div>`;
 $('#shipping-message').textContent=t.freeDelivery?'Happy little bonus: your delivery is free.':`You're ${money(Math.max(0,35000-t.subtotal))} away from free delivery.`;
 $('#shipping-bar-fill').style.width=Math.min(100,t.subtotal/35000*100)+'%';
 $('#cart-totals').innerHTML=totalMarkup(t);$('#promo').value=coupon;
 $('#promo-message').textContent=coupon?'KOTY10 applied. A little 10% treat.':'Try KOTY10 for 10% off this demo basket.';
}
function renderCheckoutSummary(){
 const city=$('#checkout-city').value,t=S.calculate(cart,{city,coupon});
 $('#checkout-items').innerHTML=cart.map(line=>{const p=S.find(line.id);return `<div class="summary-row"><img src="assets/${p.image}.webp" alt="${esc(p.name)}"><div><strong>${esc(p.name)} × ${line.qty}</strong><p>${esc(itemOptions(line))}</p></div><b>${money(S.unitPrice(line)*line.qty)}</b></div>`}).join('');
 $('#checkout-totals').innerHTML=totalMarkup(t);
}

function openDetail(id){
 const p=S.find(id);if(!p)return;detailId=id;detailQty=1;
 $('#product-detail').innerHTML=`<div class="product-detail-layout"><div class="detail-image">${imageMarkup(p)}</div><div class="detail-info"><div class="eyebrow">LOW FAT · ${esc(p.tag)}</div><h2 id="detail-title">${esc(p.name)}</h2><p class="detail-description">${esc(p.description)}</p><div class="detail-price" id="detail-price">${money(p.price)}</div>${p.category==='bundles'?'<p class="detail-description">A ready-to-share box with regular sizes and the pictured toppings.</p>':`<fieldset><legend>Make it your size</legend><div class="option-group">${Object.entries(S.sizes).map(([k,v])=>`<label><input type="radio" name="detail-size" value="${k}" ${k==='regular'?'checked':''}>${v.label}${v.extra?' +'+money(v.extra):''}</label>`).join('')}</div></fieldset><fieldset><legend>Your finishing touch</legend><div class="option-group">${Object.entries(S.toppings).map(([k,v])=>`<label><input type="radio" name="detail-topping" value="${k}" ${k==='none'?'checked':''}>${v.label}${v.extra?' +'+money(v.extra):''}</label>`).join('')}</div></fieldset>`}<div class="detail-add-row"><div class="quantity"><button id="detail-minus" aria-label="Decrease quantity">−</button><span id="detail-qty">1</span><button id="detail-plus" aria-label="Increase quantity">+</button></div><button class="button primary" id="detail-add">Add to bag <span>↗</span></button></div><div class="detail-allergens"><strong>Sample ingredients</strong><br>${esc(p.ingredients)}<br><strong>Allergens:</strong> ${esc(p.allergens)}<br>Extra nuts add tree nuts; chocolate toppings may contain soy. Final ingredients and nutritional values must be confirmed for the live menu.</div></div></div>`;
 $('#product-detail').querySelectorAll('input').forEach(input=>input.addEventListener('change',updateDetailPrice));
 $('#detail-minus').onclick=()=>{detailQty=Math.max(1,detailQty-1);updateDetailPrice()};
 $('#detail-plus').onclick=()=>{detailQty=Math.min(10,detailQty+1);updateDetailPrice()};
 $('#detail-add').onclick=()=>{const options=detailOptions();addItem(detailId,{...options,qty:detailQty});closeDialog('product-dialog')};
 openDialog('product-dialog');
}
function detailOptions(){return {size:$('input[name="detail-size"]:checked')?.value||'regular',topping:$('input[name="detail-topping"]:checked')?.value||'none'}}
function updateDetailPrice(){const opt=detailOptions();$('#detail-price').textContent=money(S.unitPrice({id:detailId,...opt})*detailQty);$('#detail-qty').textContent=detailQty;$('#detail-minus').disabled=detailQty===1;$('#detail-plus').disabled=detailQty===10}

document.addEventListener('click',e=>{
 const detail=e.target.closest('[data-detail]');if(detail){openDetail(detail.dataset.detail);return;}
 const wish=e.target.closest('[data-wish]');if(wish){const id=wish.dataset.wish;wishlist.has(id)?wishlist.delete(id):wishlist.add(id);save('koty-wishlist-v1',[...wishlist]);renderCatalog();return;}
 const add=e.target.closest('[data-add]');if(add){addItem(add.dataset.add);return;}
 const qty=e.target.closest('[data-qty]');if(qty){const line=cart.find(l=>l.key===qty.dataset.qty);if(line){cart=S.setQty(cart,line.key,line.qty+Number(qty.dataset.delta));persistCart();}return;}
 const remove=e.target.closest('[data-remove]');if(remove){cart=cart.filter(l=>l.key!==remove.dataset.remove);persistCart();return;}
 if(e.target.closest('#reset-filters'))resetFilters();
 if(e.target.closest('#empty-shop')){closeDialog('cart-dialog');$('#shop').scrollIntoView({behavior:'smooth'});}
});
$$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;savedOnly=false;$$('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});renderCatalog()});
function resetFilters(){filter='all';query='';savedOnly=false;$('#product-search').value='';$$('[data-filter]').forEach(x=>{const active=x.dataset.filter==='all';x.classList.toggle('active',active);x.setAttribute('aria-pressed',active)});renderCatalog()}
$('#product-search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderCatalog()});
$('#sort').onchange=e=>{sort=e.target.value;renderCatalog()};
$('#wishlist-toggle').onclick=()=>{savedOnly=!savedOnly;filter='all';query='';$('#product-search').value='';$$('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter==='all');b.setAttribute('aria-pressed',b.dataset.filter==='all')});renderCatalog();$('#shop').scrollIntoView({behavior:'smooth'})};
$('#search-toggle').onclick=()=>{$('#shop').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('#product-search').focus({preventScroll:true}),400)};
$('#cart-toggle').onclick=()=>{renderCart();openDialog('cart-dialog')};
$('#promo-form').onsubmit=e=>{e.preventDefault();const code=$('#promo').value.trim().toUpperCase();if(!code){coupon='';persistCart();toast('Discount code removed.')}else if(code==='KOTY10'){coupon=code;persistCart();toast('KOTY10 applied — a little 10% treat.')}else{$('#promo-message').textContent='That code is not available. Try KOTY10.'}};
$('#checkout-open').onclick=()=>{if(!cart.length)return;closeDialog('cart-dialog');renderCheckoutSummary();$('#checkout-error').textContent='';openDialog('checkout-dialog')};
$('#checkout-city').onchange=renderCheckoutSummary;
$$('input[name="payment"]').forEach(r=>r.onchange=()=>{
 $('#payment-note').textContent=r.value==='cash'?'This is a demo order. No delivery or payment will occur.':r.value==='card'?'Card payment is preview-only until a payment provider is connected. This form never asks for card details.':'Wallet payment is preview-only until a payment provider is connected. No wallet transfer will be requested.';
});
$('#checkout-form').onsubmit=e=>{
 e.preventDefault();if(!cart.length){$('#checkout-error').textContent='Your bag is empty. Add a flavor before checking out.';return;}
 const form=e.currentTarget,data=Object.fromEntries(new FormData(form).entries());data.agreement=!!data.agreement;
 const errors=S.validateCustomer(data);if(errors.length){$('#checkout-error').textContent=errors.join(' ');return;}
 const order={id:'KC-DEMO-'+Date.now().toString(36).toUpperCase(),createdAt:new Date().toISOString(),customer:{name:data.name.trim(),phone:data.phone.trim(),email:data.email?.trim()||'',city:data.city,area:data.area.trim(),address:data.address.trim(),note:data.note?.trim()||''},payment:data.payment,items:cart.map(l=>({...l,unitPrice:S.unitPrice(l)})),totals:S.calculate(cart,{city:data.city,coupon}),demo:true};
 save('koty-last-demo-order',order);cart=[];coupon='';persistCart();form.reset();closeDialog('checkout-dialog');showReceipt(order);
};
function showReceipt(order){
 const method={cash:'Cash on delivery',card:'Credit / debit card',wallet:'Mobile wallet'}[order.payment];
 $('#receipt').innerHTML=`<div class="receipt-mark">✓</div><div class="eyebrow" style="justify-content:center">A HAPPY LITTLE PREVIEW</div><h2 id="receipt-title">That's your<br><em>happy haul.</em></h2><p>Thanks, ${esc(order.customer.name)}! Your demo order was saved on this browser. No money was charged and no delivery will take place.</p><div class="receipt-id">${esc(order.id)}</div><div class="receipt-lines">${order.items.map(l=>`<p>${esc(S.find(l.id).name)} × ${l.qty} <strong style="float:right">${money(l.unitPrice*l.qty)}</strong></p>`).join('')}<hr style="border:0;border-top:1px solid var(--line);margin:15px 0"><p><strong>Demo total</strong><strong style="float:right">${money(order.totals.total)}</strong></p><p>Selected method: ${esc(method)} · not processed</p><p>Delivery preview: ${esc(order.customer.city)}, ${esc(order.customer.area)}</p></div><button class="button primary wide" id="receipt-download">Download demo receipt <span>↗</span></button><button class="text-link" id="receipt-shop">A little more browsing ↗</button>`;
 $('#receipt-download').onclick=()=>{
  const text=['KOTY CONO — DEMO RECEIPT','No payment was made. No delivery is arranged.',order.id,'',...order.items.map(l=>`${S.find(l.id).name} x ${l.qty}: ${money(l.unitPrice*l.qty)}`),'',`Subtotal: ${money(order.totals.subtotal)}`,`Discount: ${money(order.totals.discount)}`,`Delivery preview: ${money(order.totals.delivery)}`,`Demo total: ${money(order.totals.total)}`,`Selected payment: ${method} (not processed)`].join('\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=order.id+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 $('#receipt-shop').onclick=()=>{closeDialog('receipt-dialog');$('#shop').scrollIntoView({behavior:'smooth'})};openDialog('receipt-dialog');
}
const policies={
 delivery:{title:'A little delivery info.',text:'This concept store offers a demo of city-based delivery pricing. Cairo: EGP 50; Giza: EGP 55; Alexandria: EGP 75; Mansoura: EGP 65. Demo baskets of EGP 350 or more receive free delivery. No delivery service is currently arranged by this website. Live areas, handling requirements and delivery times must be confirmed before real ordering.'},
 privacy:{title:'Your little privacy note.',text:'This demo keeps your bag, saved flavors, discount code and latest demo order in local storage on this browser. Your checkout details are not sent to a merchant or payment processor. You can delete them by clearing this site’s browser data. The form never requests card numbers or wallet credentials. No advertising or analytics trackers are used by this storefront code.'},
 terms:{title:'The small print.',text:'Koty Cono is a concept storefront in demonstration mode. Menu names, prices, images, delivery rates and the KOTY10 discount are sample content. Images are illustrative. Product nutrition, ingredients, availability, business details and payment arrangements must be confirmed before real sales. A demo confirmation does not constitute a purchase, payment, delivery request or merchant acceptance.'}
};
$$('[data-policy]').forEach(b=>b.onclick=()=>{const p=policies[b.dataset.policy];$('#policy-content').innerHTML=`<div class="eyebrow">GOOD TO KNOW</div><h2 id="policy-title">${esc(p.title)}</h2><p>${esc(p.text)}</p>`;openDialog('policy-dialog')});
$('#year').textContent=new Date().getFullYear();renderCatalog();renderCart();renderCheckoutSummary();

// One advertising actor follows the entire document; commerce stays independent.
const track=$('#home'),actor=$('#site-cone'),anchor=$('#cone-anchor'),reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
let sprite=null,spriteReady=false,desired=.04,current=.04,lastTime=0,raf=0,visible=true;
let layout={x:0,y:0,w:0,dock:0};
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,p)=>a+(b-a)*p;
function updateScroll(){
 const vh=innerHeight,vw=document.documentElement.clientWidth,header=$('#header').offsetHeight;
 const max=Math.max(1,document.documentElement.scrollHeight-vh),global=clamp(scrollY/max);
 const heroDistance=Math.max(1,track.offsetHeight-$('.hero-sticky').offsetHeight),hero=clamp((scrollY-track.offsetTop+header)/heroDistance);
 const rect=anchor.getBoundingClientRect(),dock=reducedQuery.matches?0:ease((scrollY-(track.offsetTop+track.offsetHeight-vh)) / Math.max(1,vh*.65));
 const small=vw<=760,railW=small?66:vw<=1000?104:190;
 const w=mix(rect.width,railW,dock),x=mix(rect.left+rect.width/2,vw-(small?40:vw<=1000?67:116),dock);
 const y=mix(rect.top+rect.height/2,header+(vh-header)*.48,dock)+(reducedQuery.matches?scrollY:0);
 layout={x,y,w,dock};actor.style.width=w+'px';actor.style.height=w*1.5+'px';actor.style.left=x+'px';actor.style.top=y+'px';actor.style.setProperty('--dock',dock.toFixed(3));
 actor.classList.toggle('docked',dock>.98);actor.classList.toggle('hero-active',dock<.01);
 desired=hero<1?.04+hero*.91:.95+Math.max(0,scrollY-(track.offsetTop-header+heroDistance))/Math.max(1500,vh*2.2);
 const creamSurfaces=[$('#shop'),$('.bundle-banner')];actor.classList.toggle('on-cream',creamSurfaces.some(el=>{const r=el.getBoundingClientRect();return y>=r.top&&y<=r.bottom}));
 const chapter=hero<.2?'original':hero<.72?'magic':'joy';['original','magic','joy'].forEach(id=>$('#chapter-'+id).classList.toggle('active',id===chapter));
 document.documentElement.style.setProperty('--scroll',hero.toFixed(4));$('#scroll-progress').style.width=global*100+'%';$('#journey-progress').style.width=global*100+'%';
 $('#scroll-percent').textContent=Math.round(global*100).toString().padStart(2,'0')+' / 100';
 if(reducedQuery.matches){current=desired;if(spriteReady)sprite.draw(current,0,true);}else startMotion();
}
function tick(time){raf=0;if(!visible||!spriteReady||reducedQuery.matches)return;if(lastTime&&time-lastTime<33){raf=requestAnimationFrame(tick);return;}const dt=Math.min(64,time-(lastTime||time));lastTime=time;current=mix(current,desired,1-Math.exp(-dt/95));sprite.draw(current,time/1400);raf=requestAnimationFrame(tick);}
function startMotion(){if(!raf&&visible&&spriteReady&&!reducedQuery.matches){lastTime=0;raf=requestAnimationFrame(tick)}}
if(typeof window.KotyConeMotion==='function'){
 sprite=new KotyConeMotion($('#hero-cone'));
 sprite.ready.then(()=>{spriteReady=true;actor.classList.add('ready');updateScroll();}).catch(()=>{actor.classList.remove('ready');});
}
let scrollQueued=false;function queueScroll(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;updateScroll()})}}
addEventListener('scroll',queueScroll,{passive:true});addEventListener('resize',queueScroll);reducedQuery.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;updateScroll()});
document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(!visible){cancelAnimationFrame(raf);raf=0;}else{updateScroll();startMotion()}});
if(typeof ResizeObserver==='function')new ResizeObserver(queueScroll).observe(document.querySelector('main'));
// Gentle cursor parallax and one-time section entrances.
addEventListener('pointermove',e=>{if(reducedQuery.matches||layout.dock>.95)return;sprite?.setPointer((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2)},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>sprite?.setPointer(0,0));
if(typeof IntersectionObserver==='function'){
 document.documentElement.classList.add('reveal-ready');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{rootMargin:'80px',threshold:.05});$$('.section-heading').forEach(el=>observer.observe(el));
}
updateScroll();
// Expose only a small diagnostic interface for verification; no customer details.
window.kotyDiagnostics={getCart:()=>cart.map(x=>({...x})),getTotals:()=>S.calculate(cart,{city:$('#checkout-city').value,coupon}),getSpriteFrame:()=>sprite?.frame??null,getMotion:()=>({progress:current,...layout,ready:spriteReady})};
})();
