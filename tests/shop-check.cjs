const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const errors=[];
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://koty-cono.vercel.app/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;
w.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
w.addEventListener('error',e=>errors.push(e.message));
for(const f of ['assets/cinematic/cinema-math.js','assets/cinematic/cinema-2d.js','store.js','app.js','cinematic.js'])w.eval(fs.readFileSync(path.join(root,f),'utf8'));
const $=s=>{const e=d.querySelector(s);assert(e,'Missing '+s);return e;};
const click=s=>$(s).click();const change=(s,value)=>{$(s).value=value;$(s).dispatchEvent(new w.Event('change',{bubbles:true}));};
const submit=s=>$(s).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
const cart=()=>w.kotyDiagnostics.getCart();
const clear=()=>{for(const e of [...d.querySelectorAll('[data-remove]')])e.click();assert.equal(cart().length,0);};
assert.equal(w.KotyStore.products.length,8);assert.equal(d.querySelectorAll('.product-card').length,8);
const original=[['vanilla',9500],['chocolate',11000],['strawberry',10500],['pistachio',13500],['mango',10000],['berry',11500]];
for(const [id,price] of original){click(`[data-flavor="${id}"]`);assert.equal($('#flavor-title').textContent,w.KotyStore.find(id).name);assert.equal($('#flavor-price').textContent,'EGP '+price/100);assert.equal($('#showcase-customize').dataset.detail,id);assert.equal(w.kotyCinemaDiagnostics.getState().flavor,id);}
click('[data-flavor="vanilla"]');change('#showcase-size','large');change('#showcase-topping','nuts');assert.equal($('#flavor-price').textContent,'EGP 140');click('#showcase-add');assert.deepEqual(JSON.parse(JSON.stringify(cart()[0])),{id:'vanilla',size:'large',topping:'nuts',qty:1,key:'vanilla:large:nuts'});
click('#cart-toggle');assert($('#cart-dialog').open);click('[data-qty][data-delta="1"]');assert.equal(cart()[0].qty,2);click('[data-qty][data-delta="-1"]');assert.equal(cart()[0].qty,1);clear();click('[data-close="cart-dialog"]');
click('[data-wish="chocolate"]');assert.equal($('#wish-count').textContent,'1');click('#wishlist-toggle');assert.equal(d.querySelectorAll('.product-card').length,1);assert.equal($('.product-title').textContent,'Cocoa Crush');click('#wishlist-toggle');
click('[data-filter="cups"]');assert.equal(d.querySelectorAll('.product-card').length,2);click('[data-filter="bundles"]');assert.equal(d.querySelectorAll('.product-card').length,2);click('[data-filter="all"]');
$('#product-search').value='Cocoa';$('#product-search').dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(d.querySelectorAll('.product-card').length,1);$('#product-search').value='';$('#product-search').dispatchEvent(new w.Event('input',{bubbles:true}));change('#sort','price-low');assert.equal($('.product-title').textContent,'Rainbow Vanilla');
click('[data-detail="strawberry"]');assert($('#product-dialog').open);change('input[name="detail-size"][value="large"]','large');$('input[name="detail-size"][value="large"]').checked=true;$('input[name="detail-topping"][value="chocolate"]').checked=true;$('input[name="detail-topping"][value="chocolate"]').dispatchEvent(new w.Event('change',{bubbles:true}));click('#detail-plus');assert.equal($('#detail-price').textContent,'EGP 290');click('#detail-add');assert.equal(cart()[0].qty,2);assert.equal(w.kotyDiagnostics.getTotals().subtotal,29000);
click('#cart-toggle');$('#promo').value='KOTY10';submit('#promo-form');assert.equal(w.kotyDiagnostics.getTotals().discount,2900);assert.equal(w.kotyDiagnostics.getTotals().total,31100);click('[data-qty][data-delta="1"]');assert.equal(w.kotyDiagnostics.getTotals().delivery,0);assert.equal(w.kotyDiagnostics.getTotals().total,39150);click('[data-qty][data-delta="-1"]');$('#promo').value='INVALID';submit('#promo-form');assert($('#promo-message').textContent.includes('not available'));assert.equal(w.kotyDiagnostics.getTotals().discount,2900);
click('#checkout-open');assert($('#checkout-dialog').open);change('#checkout-city','Alexandria');assert.equal(w.kotyDiagnostics.getTotals().delivery,7500);assert.equal(w.kotyDiagnostics.getTotals().total,33600);click('[data-close="checkout-dialog"]');clear();
for(const method of ['cash','card','wallet']){
 click('[data-add="vanilla"]');click('#cart-toggle');click('#checkout-open');
 const values={name:'Test Customer',phone:'01012345678',email:'demo@example.com',area:'Test area',address:'Test street 10'};
 for(const [name,value] of Object.entries(values))$(`[name="${name}"]`).value=value;
 change('#checkout-city','Cairo');$(`[name="payment"][value="${method}"]`).checked=true;$(`[name="payment"][value="${method}"]`).dispatchEvent(new w.Event('change'));$('[name="agreement"]').checked=true;
 submit('#checkout-form');assert($('#receipt-dialog').open);assert($('#receipt').textContent.includes('No money was charged'));const order=JSON.parse(w.localStorage.getItem('koty-last-demo-order'));assert.equal(order.demo,true);assert.equal(order.payment,method);assert.equal(cart().length,0);click('[data-close="receipt-dialog"]');
}
for(const policy of ['delivery','privacy','terms']){click(`[data-policy="${policy}"]`);assert($('#policy-dialog').open);assert($('#policy-content').textContent.length>200);click('[data-close="policy-dialog"]');}
click('#menu-toggle');assert.equal($('#menu-toggle').getAttribute('aria-expanded'),'true');click('#mobile-menu a[href="#shop"]');assert.equal($('#menu-toggle').getAttribute('aria-expanded'),'false');click('#menu-toggle');w.KotyCommerce.addItem('duo');click('#mobile-cart');assert($('#cart-dialog').open);
assert.equal(errors.length,0,errors.join('\n'));
console.log('PASS: six flavor selectors, eight catalog products, size/topping prices, favorites, categories/search/sort, cart quantities/removal, coupon and delivery thresholds, three demo checkout methods, receipts, policies and mobile navigation.');
dom.window.close();
