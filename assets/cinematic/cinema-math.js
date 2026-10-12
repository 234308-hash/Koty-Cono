/* Deterministic choreography shared by the WebGL scene and its canvas fallback. */
(function(root){
 'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
 const mix=(a,b,t)=>a+(b-a)*t;
 function pose(p){
  p=clamp(p);
  const burst=smooth((p-.09)/.14)*(1-smooth((p-.56)/.24));
  const reveal=smooth((p-.78)/.22);
  return {p,burst,reveal,dolly:Math.sin(smooth((p-.48)/.28)*Math.PI)*burst,spin:Math.sin(p*Math.PI)*burst};
 }
 function ingredient(i,p,time,aspect=1.6){
  const s=pose(p),a=i*2.399963+p*1.15,side=(i%5)/4;
  const r=mix(1.45+(i%3)*.35,3.0+(i%4)*.65,s.burst);
  const z=mix(-.8+(i%4)*.2,Math.sin(i*1.7)*2.65,s.burst);
  return {x:Math.cos(a)*r*Math.min(1,aspect/.9),y:Math.sin(a)*r*.7+Math.sin(time*.55+i)*.065,z,
   size:(.6+side*.55)*(1+s.burst*.1),rotation:a*.2+time*.1+Math.sin(i)*s.spin*1.2,
   opacity:mix(.38,.98,s.burst),blur:Math.max(0,z-1.7)*s.burst};
 }
 const api={clamp,smooth,mix,pose,ingredient};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KotyCinemaMath=api;
})(typeof window!=='undefined'?window:globalThis);
