/* Art direction and interface orchestration. Shopping never waits for WebGL. */
(()=>{
 'use strict';
 const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)],S=window.KotyStore,M=window.KotyCinemaMath;
 const media=matchMedia('(prefers-reduced-motion: reduce)'),layer=$('#cinema-layer');
 document.documentElement.classList.add('js');
 const flavors=S.products.filter(p=>p.category!=='bundles');
 const art={
  vanilla:{bg:'#21130e',accent:'#d4b390',ingredients:[6,7,3],sauce:0x6a2715},
  chocolate:{bg:'#27140f',accent:'#c79c7a',ingredients:[3,7,6],sauce:0x542411},
  strawberry:{bg:'#35151c',accent:'#dc9aa5',ingredients:[0,2,6],sauce:0xb73450},
  pistachio:{bg:'#252719',accent:'#c4cb92',ingredients:[4,7,6],sauce:0x9da954},
  mango:{bg:'#362511',accent:'#eac173',ingredients:[5,6,7],sauce:0xe1a12e},
  berry:{bg:'#2e1424',accent:'#c592b1',ingredients:[1,2,0],sauce:0x9b2854}
 };
 let selected=0,pending=null,transitionStart=0,transitioning=false,switched=false;
 let engine=null,assets=null,raf=0,last=0,clock=0,introStart=0,intro=false,ready=false,scrollDirty=true,interacted=false;
 let scrollState={mode:'home',progress:0,active:true},pointer={x:0,y:0},lastScroll=window.scrollY,sceneError=null;
 const loadImage=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Asset could not load: '+src));image.src=src;});
 function price(){
  const p=flavors[selected];$('#flavor-price').textContent='EGP '+(S.unitPrice({id:p.id,size:$('#showcase-size').value,topping:$('#showcase-topping').value})/100).toLocaleString('en-EG');
 }
 function updateProduct(index){
  selected=index;const p=flavors[index],a=art[p.id];
  $('#flavor-title').textContent=p.name;$('#flavor-description').textContent=p.description;$('#flavor-tag').textContent=p.tag.toUpperCase();$('#flavor-number').textContent=String(index+1).padStart(2,'0')+' / 06';
  $('#showcase-customize').dataset.detail=p.id;
  $$('[data-flavor]').forEach(b=>{const current=b.dataset.flavor===p.id;b.classList.toggle('active',current);b.setAttribute('aria-pressed',String(current));});
  if(scrollState.mode==='flavors')setPalette(a);price();
 }
 function setPalette(a){document.documentElement.style.setProperty('--scene-bg',a.bg);document.documentElement.style.setProperty('--scene-accent',a.accent);}
 function selectFlavor(id){
  const index=flavors.findIndex(p=>p.id===id);if(index<0||index===selected&&!transitioning)return;
  stopIntro();
  // Rapid selections converge on the most recent request without mismatching price and item.
  if(transitioning){pending=index;return;}
  if(media.matches||!ready){updateProduct(index);renderStill();return;}
  pending=index;transitionStart=performance.now();transitioning=true;switched=false;$('#flavor-title').parentElement.classList.add('changing');start();
 }
 $$('[data-flavor]').forEach((button,i)=>{
  button.addEventListener('click',()=>selectFlavor(button.dataset.flavor));
  button.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const buttons=$$('[data-flavor]'),n=e.key==='Home'?0:e.key==='End'?5:(i+(e.key==='ArrowRight'?1:5))%6;buttons[n].focus();selectFlavor(buttons[n].dataset.flavor);});
 });
 $('#showcase-size').addEventListener('change',price);$('#showcase-topping').addEventListener('change',price);
 $('#showcase-add').addEventListener('click',()=>{window.KotyCommerce.addItem(flavors[selected].id,{size:$('#showcase-size').value,topping:$('#showcase-topping').value});});
 function stopIntro(){interacted=true;layer.classList.remove('loading-intro');intro=false;$('#skip-intro').hidden=true;$('#intro-caption').style.opacity='0';document.documentElement.style.setProperty('--reveal','1');}
 $('#skip-intro').addEventListener('click',()=>{stopIntro();renderStill();});
 $('#replay-intro').addEventListener('click',()=>{if(media.matches)return;window.scrollTo({top:0,behavior:'instant'});intro=true;introStart=performance.now();$('#skip-intro').hidden=false;scrollDirty=true;start();});
 function menu(open){$('#mobile-menu').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');}
 $('#menu-toggle').addEventListener('click',()=>menu($('#mobile-menu').hidden));
 $('#mobile-cart').addEventListener('click',()=>{menu(false);window.KotyCommerce.openCart();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')menu(false);});
 $$('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{stopIntro();menu(false);scrollDirty=true;}));
 document.addEventListener('koty:cartchange',()=>{
  const bag=$('#cart-toggle');bag.classList.remove('cart-bump');void bag.offsetWidth;bag.classList.add('cart-bump');setTimeout(()=>bag.classList.remove('cart-bump'),550);
 });
 document.addEventListener('koty:added',e=>{
  if(media.matches)return;const id=e.detail.id,p=S.find(id);
  const source=document.querySelector(`[data-add="${id}"]`)||$('#showcase-add'),r=source.getBoundingClientRect(),bag=$('#cart-toggle').getBoundingClientRect();
  if(r.top<0||r.top>innerHeight)return;
  const image=document.createElement('img');image.className='fly-to-bag';image.alt='';image.src='assets/'+p.image+'.webp';image.style.left=r.left+'px';image.style.top=r.top+'px';document.body.append(image);
  if(typeof image.animate!=='function'){image.remove();return;}
  const anim=image.animate([{transform:'translate(0,0) rotate(-8deg) scale(1)',opacity:1},{transform:`translate(${(bag.left-r.left)*.45}px,${Math.min(-80,(bag.top-r.top)*.65)}px) rotate(7deg) scale(.85)`,opacity:1},{transform:`translate(${bag.left-r.left+10}px,${bag.top-r.top}px) rotate(0deg) scale(.1)`,opacity:0}],{duration:800,easing:'cubic-bezier(.25,.7,.3,1)'});anim.onfinish=()=>image.remove();setTimeout(()=>image.remove(),1100);
 });
 function measure(){
  scrollDirty=false;const h=innerHeight,home=$('#home').getBoundingClientRect(),flavor=$('#flavors').getBoundingClientRect();
  const isFlavor=flavor.top<=h*.27&&flavor.bottom>h*.23;
  const isHome=home.bottom>h*.23&&home.top<h*.8&&!isFlavor;
  const mode=isFlavor?'flavors':isHome?'home':'other',old=scrollState.mode;
  scrollState={mode,active:isHome||isFlavor,progress:M.clamp(-home.top/Math.max(1,home.height-h))};
  layer.classList.toggle('inactive',!scrollState.active);layer.classList.toggle('flavors-active',isFlavor);
  if(old!==mode)setPalette(isFlavor?art[flavors[selected].id]:art.vanilla);
  const currentSection=isHome?'home':isFlavor?'flavors':$('#shop').getBoundingClientRect().bottom>h*.25?'shop':'story';
  $$('.desktop-nav a,.scene-nav a').forEach(a=>{const active=a.getAttribute('href')==='#'+currentSection;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  const story=$('.story-art>img');if(!media.matches){const r=$('#story').getBoundingClientRect();if(r.top<h&&r.bottom>0)story.style.transform=`translateY(${M.clamp((r.top-h*.3)/h,-1,1)*18}px) rotate(${M.clamp((r.top-h*.3)/h,-1,1)*-2}deg)`;}
 }
 function state(now){
  let p=1,transition=0;
  if(intro){p=M.clamp((now-introStart)/6600);if(p>=1)stopIntro();}
  else if(scrollState.mode==='home'&&scrollState.progress>.005&&scrollState.progress<.98)p=scrollState.progress;
  if(transitioning){
   const t=M.clamp((now-transitionStart)/1350);transition=Math.sin(t*Math.PI);
   if(t>=.48&&!switched){updateProduct(pending);switched=true;$('#flavor-title').parentElement.classList.remove('changing');}
   if(t>=1){transitioning=false;if(pending!==selected){const next=pending;pending=null;selectFlavor(flavors[next].id);}else pending=null;}
  }
  const a=art[flavors[selected].id],s=M.pose(p);
  if(scrollState.mode==='home'){
   document.documentElement.style.setProperty('--reveal',String(intro?s.reveal:1-s.burst*.9));
   $('#intro-caption').style.opacity=String(intro?(1-s.reveal)*(.9-s.burst*.7):0);
  }else document.documentElement.style.setProperty('--reveal','1');
  document.documentElement.style.setProperty('--burst',String(s.burst));
  return {p:media.matches?1:p,time:clock,flavors:scrollState.mode==='flavors',flavor:selected,transition,ingredients:scrollState.mode==='flavors'?a.ingredients:[6,7,3],sauce:scrollState.mode==='flavors'?a.sauce:0x6a2715,still:media.matches,pointer};
 }
 function frame(now){
  raf=0;if(document.hidden||!ready)return;
  if(scrollDirty)measure();
  const interval=innerWidth<760?1000/30:1000/50;
  if(!last||now-last>=interval){clock+=(last?Math.min(100,now-last):16)/1000;last=now;if(scrollState.active&&!document.querySelector('dialog[open]'))engine.draw(state(now));}
  if(!media.matches&&(scrollState.active||transitioning||scrollDirty))raf=requestAnimationFrame(frame);
 }
 function start(){if(!raf&&ready&&!document.hidden)raf=requestAnimationFrame(frame);}
 function renderStill(){if(!ready)return;if(scrollDirty)measure();if(scrollState.active)engine.draw(state(performance.now()));}
 function resize(){if(!engine)return;engine.resize(document.documentElement.clientWidth,innerHeight,Math.min(devicePixelRatio||1,innerWidth<760?1.25:1.6));scrollDirty=true;if(media.matches)renderStill();else start();}
 function fallback(){
  engine?.dispose();const old=$('#cinema-canvas'),replacement=old.cloneNode(false);old.replaceWith(replacement);engine=new window.KotyCinema2D(replacement,assets);ready=true;resize();layer.classList.add('ready');
 }
 Promise.all([loadImage(innerWidth<760?'assets/icecream-poster.png':'assets/icecream-source.webp'),loadImage('assets/cinematic/ingredients.webp'),loadImage('assets/cinematic/flavors.webp')]).then(async images=>{
  assets={cone:images[0],ingredients:images[1],flavors:images[2]};
  if(media.matches){fallback();stopIntro();renderStill();return;}
  try{
   const {CinemaWebGL}=await import('./assets/cinematic/cinema-webgl.js');engine=new CinemaWebGL($('#cinema-canvas'),assets);ready=true;resize();layer.classList.add('ready');
   $('#cinema-canvas').addEventListener('webglcontextlost',e=>{e.preventDefault();sceneError='WebGL context lost; using the canvas fallback.';stopIntro();fallback();});
  }catch(error){sceneError=String(error.message||error);fallback();}
  if(scrollY<8&&!media.matches&&!interacted){layer.classList.remove('loading-intro');intro=true;introStart=performance.now();$('#skip-intro').hidden=false;}start();
 }).catch(error=>{sceneError=String(error.message||error);stopIntro();layer.classList.remove('ready');});
 addEventListener('scroll',()=>{if(intro&&Math.abs(scrollY-lastScroll)>6)stopIntro();lastScroll=scrollY;scrollDirty=true;if(media.matches)renderStill();else start();},{passive:true});
 addEventListener('resize',resize);
 addEventListener('pointermove',e=>{if(media.matches||e.pointerType==='touch')return;pointer={x:(e.clientX/innerWidth-.5)*2,y:(e.clientY/innerHeight-.5)*2};},{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{pointer={x:0,y:0};});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else {last=0;scrollDirty=true;start();}});
 media.addEventListener('change',()=>{stopIntro();cancelAnimationFrame(raf);raf=0;if(assets){if(media.matches&&engine?.mode==='webgl')fallback();scrollDirty=true;resize();renderStill();if(!media.matches)start();}});
 if(typeof IntersectionObserver==='function'){
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.05,rootMargin:'80px'});
  $$('.section-heading,.story-copy,.bundle-banner-copy').forEach(el=>{el.classList.add('reveal-section');observer.observe(el);});
 }
 if(!media.matches){layer.classList.add('loading-intro');document.documentElement.style.setProperty('--reveal','0');}
 measure();updateProduct(0);
 window.kotyCinemaDiagnostics={getState:()=>({ready,mode:engine?.mode||'poster',scene:scrollState.mode,flavor:flavors[selected].id,intro,transitioning,error:sceneError}),selectFlavor,skipIntro:stopIntro};
})();
