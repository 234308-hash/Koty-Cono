(function(root){
 'use strict';
 const M=typeof module!=='undefined'&&module.exports?require('./cinema-math.js'):root.KotyCinemaMath;
 class Cinema2D{
  constructor(canvas,assets){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.assets=assets;this.mode='canvas';}
  resize(w,h,dpr=1){this.w=w;this.h=h;this.dpr=dpr;this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);}
  draw(state){
   const {ctx:c,assets:a,w,h,dpr}=this;if(!w||!h)return;
   c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
   const s=M.pose(state.p),small=w<760,unit=h/7.4;
   const cx=state.flavors?(small?w*.765:w*.73):M.mix(w*.5,small?w*.5:w*.73,s.reveal);
   const cy=small?(state.flavors?h*.575:h<700?h*.72:h*.67):h*.5,productH=small?(state.flavors?h*.32:h<700?h*.38:h*.43):h*.81;
   const ids=state.ingredients||[6,7,3],count=state.still?4:Math.round(M.mix(small?5:8,small?14:24,s.burst));
   const particles=Array.from({length:count},(_,i)=>({...M.ingredient(i,state.p,state.time,w/h),i})).sort((x,y)=>x.z-y.z);
   const sprite=(r)=>{
    c.save();const f=8.8/(8.8-r.z),size=r.size*unit*f*M.mix(.65,1,s.burst);
    c.translate(cx+r.x*unit*f,cy+r.y*unit*f);c.rotate(r.rotation);
    c.globalAlpha=state.still?.8:M.mix(.82,1,s.burst);c.drawImage(a.ingredients,(ids[r.i%ids.length]%4)*a.ingredients.width/4,Math.floor(ids[r.i%ids.length]/4)*a.ingredients.height/2,a.ingredients.width/4,a.ingredients.height/2,-size/2,-size/2,size,size);c.restore();
   };
   particles.filter(r=>r.z<=0).forEach(sprite);
   c.save();c.translate(cx,cy);c.rotate(state.still?0:Math.sin(state.time*.7)*.012+s.spin*.04);
   if(state.flavors&&state.flavor!==0){
    const image=a.flavors,cellW=image.width/3,cellH=image.height/2,scale=1-(state.transition||0)*.32;
    c.globalAlpha=1-(state.transition||0)*.72;c.drawImage(image,(state.flavor%3)*cellW,Math.floor(state.flavor/3)*cellH,cellW,cellH,-productH*scale/2,-productH*scale/2,productH*scale,productH*scale);
   }else{
    const image=a.cone,ph=productH,pw=ph*image.width/image.height,edges=[0,.22,.32,.42,.5,1];
    for(let i=0;i<5;i++){
     const top=edges[i],bottom=edges[i+1],burst=state.still?0:s.burst;
     c.save();if(i<4){c.translate(Math.sin(i*2.5)*burst*unit*.8,-(4-i)*burst*unit*.22);c.rotate(Math.sin(i)*burst*.14);}
     c.drawImage(image,0,top*image.height,image.width,(bottom-top)*image.height,-pw/2,-ph/2+top*ph,pw,(bottom-top)*ph);c.restore();
    }
   }c.restore();particles.filter(r=>r.z>0).forEach(sprite);
  }
  dispose(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);}
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=Cinema2D;else root.KotyCinema2D=Cinema2D;
})(typeof window!=='undefined'?window:globalThis);
