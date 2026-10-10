/* Reference-inspired choreography. One rigid photographic cone, independent
   cream, a dispensing ribbon, and deterministic depth-sorted sprinkles. */
(()=>{
'use strict';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
function pose(progress){
 const p=((progress%1)+1)%1,burst=smooth((p-.2)/.18)*(1-smooth((p-.5)/.21));
 return {phase:p,grow:1,lift:0,burst,tilt:Math.sin(p*Math.PI*2)*.045,stream:smooth((p-.48)/.07)*(1-smooth((p-.68)/.08)),frontier:38+105*burst,creamY:0};
}
const rim=[[0,224],[94,223],[105,228],[116,229],[126,231],[143,236],[157,237],[169,234],[177,224],[186,224],[196,229],[204,233],[214,231],[224,224],[235,219],[320,219]];
function boundary(x){for(let i=1;i<rim.length;i++)if(x<=rim[i][0]){const a=rim[i-1],b=rim[i];return mix(a[1],b[1],(x-a[0])/(b[0]-a[0]));}return 219}
class KotyConeMotion{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.frame=0;this.pointer={x:0,y:0};this.image=new Image();this.ready=new Promise((resolve,reject)=>{this.image.onload=()=>resolve(this);this.image.onerror=reject});this.image.src='assets/icecream-source.webp';}
 outline(ctx,upper){ctx.beginPath();ctx.moveTo(0,upper?0:480);ctx.lineTo(320,upper?0:480);for(let x=320;x>=0;x-=2)ctx.lineTo(x,boundary(x));ctx.closePath();}
 photo(ctx){ctx.drawImage(this.image,16,24,288,432)}
 particles(ctx,p,front){const colors=['#ee5992','#16b9c5','#ffc332','#af65c8','#ff8947'];for(let i=0;i<26;i++){if((i%3!==0)!==front)continue;const u=(p+i*.6180339)%1,fade=smooth(u/.12)*smooth((1-u)/.18);ctx.save();ctx.globalAlpha=fade*.9;const x=29+(i*73%265)+Math.sin(u*6.28+i)*13,y=20+u*u*300;ctx.translate(x,y);ctx.rotate(i+u*5);ctx.fillStyle=colors[i%5];const z=front?1.5:1;ctx.beginPath();ctx.roundRect(-3*z,-1.2*z,6*z,2.4*z,1.2*z);ctx.fill();ctx.restore();}}
 ribbon(ctx,s,ambient){if(s.stream<.002)return;const top=s.frontier+7,bend=Math.sin(s.phase*24+ambient)*11,x=154+Math.sin(s.phase*17)*s.grow*9;ctx.save();ctx.globalAlpha=s.stream;const g=ctx.createLinearGradient(x-18,0,x+18,0);g.addColorStop(0,'#cfc5b7');g.addColorStop(.24,'#f4ead9');g.addColorStop(.55,'#fff8e9');g.addColorStop(.8,'#efe3d0');g.addColorStop(1,'#c9bdab');ctx.strokeStyle=g;ctx.lineWidth=24;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(160,9);ctx.bezierCurveTo(147+bend,top*.33,180+bend,top*.66,x,top);ctx.stroke();ctx.strokeStyle='#fffbf0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(154,9);ctx.bezierCurveTo(142+bend,top*.33,173+bend,top*.66,x-6,top);ctx.stroke();ctx.restore();}
 setPointer(x,y){this.pointer={x,y}}
 ingredients(ctx,s,ambient,front){if(s.burst<.005)return;for(let i=0;i<8;i++){const a=i*Math.PI/4+s.phase*2+ambient*.13,z=Math.sin(a);if((z>0)!==front)continue;const x=160+Math.cos(a)*(93+34*s.burst),y=173+z*(76+22*s.burst),size=(7+3*(z+1))*s.burst;ctx.save();ctx.globalAlpha=s.burst*.94;ctx.translate(x,y);ctx.rotate(a*.5);const grad=ctx.createLinearGradient(-size,-size,size,size);grad.addColorStop(0,'#a57450');grad.addColorStop(.35,'#74482d');grad.addColorStop(1,'#311c12');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(-size,-size*.6);ctx.lineTo(size*.4,-size);ctx.lineTo(size,size*.5);ctx.lineTo(-size*.5,size);ctx.closePath();ctx.fill();ctx.strokeStyle='#e0af7b75';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-size,-size*.6);ctx.lineTo(size*.4,-size);ctx.lineTo(size,size*.5);ctx.stroke();ctx.strokeStyle='#2a160e80';ctx.beginPath();ctx.moveTo(-size*.5,-size*.3);ctx.lineTo(size*.55,size*.2);ctx.moveTo(0,-size*.7);ctx.lineTo(size*.2,size*.6);ctx.stroke();ctx.restore();}}
 cream(ctx,s){
  if(s.burst<.001){ctx.save();this.outline(ctx,true);ctx.clip();this.photo(ctx);ctx.restore();return;}
  // Unfold the original photographic swirl into four softly rotating tiers.
  const edges=[0,91,139,183,246],dx=[-12,30,-28,8],dy=[-28,-8,15,20],angles=[-.09,.12,-.1,.06];
  for(let i=3;i>=0;i--){const cy=(edges[i]+edges[i+1])/2;ctx.save();ctx.translate(160+dx[i]*s.burst,cy+dy[i]*s.burst);ctx.rotate(angles[i]*s.burst);ctx.translate(-160,-cy);this.outline(ctx,true);ctx.clip();ctx.beginPath();ctx.moveTo(0,edges[i]);ctx.quadraticCurveTo(160,edges[i]-16,320,edges[i]);ctx.lineTo(320,edges[i+1]);ctx.quadraticCurveTo(160,edges[i+1]-16,0,edges[i+1]);ctx.closePath();ctx.clip();this.photo(ctx);ctx.restore();}
 }
 draw(progress,ambient=0,still=false){const ctx=this.ctx,s=still?{phase:0,grow:1,lift:0,burst:0,tilt:0,stream:0,frontier:25,creamY:0}:pose(progress);this.frame=Math.floor(s.phase*64);ctx.setTransform(this.canvas.width/320,0,0,this.canvas.height/480,0,0);ctx.clearRect(0,0,320,480);if(!still){this.particles(ctx,(s.phase+ambient*.07)%1,false);this.ingredients(ctx,s,ambient,false);}ctx.save();ctx.translate(160+(!still?this.pointer.x*2:0),290+(!still?Math.sin(ambient)*1.5+this.pointer.y*1.2:0));ctx.rotate(s.tilt);ctx.translate(-160,-290);
  // The waffle remains the same rigid product throughout the choreography.
  ctx.save();this.outline(ctx,false);ctx.clip();this.photo(ctx);ctx.restore();
  this.ribbon(ctx,s,ambient);this.cream(ctx,s);ctx.restore();if(!still){this.ingredients(ctx,s,ambient,true);this.particles(ctx,(s.phase+ambient*.07)%1,true);}return s;
 }
}
window.KotyConeMotion=KotyConeMotion;window.KotyConePose=pose;
})();
