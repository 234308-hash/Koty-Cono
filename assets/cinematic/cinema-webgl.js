import * as T from '../vendor/three.module.min.js';
const M=window.KotyCinemaMath;
function map(image,col=0,row=0,cols=1,rows=1){
 const t=new T.Texture(image);t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;
 t.repeat.set(1/cols,1/rows);t.offset.set(col/cols,1-(row+1)/rows);return t;
}
function photo(texture,depthBlur=false){
 const material=new T.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.035,depthWrite:false,side:T.DoubleSide,toneMapped:false});
 if(depthBlur){
  material.onBeforeCompile=shader=>{
   shader.uniforms.uDefocus={value:0};material.userData.defocus=shader.uniforms.uDefocus;
   shader.fragmentShader='uniform float uDefocus;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
    vec2 radius=vec2(uDefocus / 1774.0, uDefocus / 887.0);
    vec4 foodColor=texture2D(map,vMapUv)*0.4;
    foodColor+=texture2D(map,vMapUv+radius*vec2(1.0,0.0))*0.15;
    foodColor+=texture2D(map,vMapUv-radius*vec2(1.0,0.0))*0.15;
    foodColor+=texture2D(map,vMapUv+radius*vec2(0.0,1.0))*0.15;
    foodColor+=texture2D(map,vMapUv-radius*vec2(0.0,1.0))*0.15;
    diffuseColor*=foodColor;
    #endif`);
  };
  material.customProgramCacheKey=()=> 'koty-food-defocus-v1';
 }
 return material;
}
function ribbon(seed){
 const n=70,pos=[],uv=[],indices=[];
 for(let i=0;i<=n;i++){
  const t=i/n,a=seed+t*3.1,r=1.2+t*2.2;
  const center=new T.Vector3(Math.cos(a)*r,Math.sin(a)*r*.72,Math.sin(a*1.6)*.7-.4);
  const width=(.035+Math.sin(t*Math.PI)*.22)*(1+.5*Math.sin(t*28));
  for(let side of [-1,1]){pos.push(center.x+Math.cos(a+1.57)*width*side,center.y+Math.sin(a+1.57)*width*side,center.z+Math.sin(t*12)*width*side);uv.push(t,(side+1)/2);}
  if(i<n){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export class CinemaWebGL{
 constructor(canvas,assets,Renderer=T.WebGLRenderer){
  this.mode='webgl';this.renderer=new Renderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.setClearColor(0,0);
  this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(42,1,.1,40);this.camera.position.z=9.6;
  this.scene.add(new T.HemisphereLight(0xffeed5,0x4b2015,2.4));
  const key=new T.PointLight(0xffe6bd,55,20);key.position.set(-3,5,5);this.scene.add(key);
  const rim=new T.PointLight(0xffffff,35,15);rim.position.set(5,2,3);this.scene.add(rim);
  this.actor=new T.Group();this.scene.add(this.actor);this.layers=[];this.textures=[];this.materials=[];
  const edges=[0,.22,.32,.42,.5,1],height=5.8,width=height*assets.cone.width/assets.cone.height;
  for(let i=0;i<5;i++){
   const top=edges[i],bottom=edges[i+1],texture=map(assets.cone);texture.repeat.y=bottom-top;texture.offset.y=1-bottom;
   const mesh=new T.Mesh(new T.PlaneGeometry(width,height*(bottom-top)),photo(texture));
   mesh.userData.baseY=height*(.5-(top+bottom)/2);mesh.position.y=mesh.userData.baseY;
   this.actor.add(mesh);this.layers.push(mesh);this.textures.push(texture);this.materials.push(mesh.material);
  }
  this.flavorMaps=Array.from({length:6},(_,i)=>map(assets.flavors,i%3,Math.floor(i/3),3,2));this.textures.push(...this.flavorMaps);
  this.flavorProduct=new T.Mesh(new T.PlaneGeometry(5.2,5.2),photo(this.flavorMaps[0]));this.flavorProduct.visible=false;this.actor.add(this.flavorProduct);this.materials.push(this.flavorProduct.material);
  this.ingredientMaps=Array.from({length:8},(_,i)=>map(assets.ingredients,i%4,Math.floor(i/4),4,2));this.textures.push(...this.ingredientMaps);
  this.ingredients=Array.from({length:28},(_,i)=>{
   const mesh=new T.Mesh(new T.PlaneGeometry(1,1),photo(this.ingredientMaps[i%8],true));this.scene.add(mesh);this.materials.push(mesh.material);return mesh;
  });
  this.sauceMaterial=new T.MeshPhysicalMaterial({color:0x6a2715,roughness:.18,metalness:.08,clearcoat:1,clearcoatRoughness:.13,side:T.DoubleSide,transparent:true,depthWrite:false});
  this.creamMaterial=this.sauceMaterial.clone();this.creamMaterial.color.set(0xf6e4c5);this.materials.push(this.sauceMaterial,this.creamMaterial);
  this.ribbons=Array.from({length:6},(_,i)=>{const mesh=new T.Mesh(ribbon(i*1.04),i%2?this.creamMaterial:this.sauceMaterial);this.scene.add(mesh);return mesh;});
  this.sprinkles=new T.InstancedMesh(new T.CapsuleGeometry(.019,.07,3,5),new T.MeshStandardMaterial({roughness:.35}),70);this.scene.add(this.sprinkles);
  this.drops=new T.InstancedMesh(new T.SphereGeometry(.07,8,6),this.sauceMaterial,26);this.scene.add(this.drops);
  this.dummy=new T.Object3D();const colors=[0xf06b91,0xfbc742,0x21b8bb,0xbe86d2,0xec8849];
  for(let i=0;i<70;i++)this.sprinkles.setColorAt(i,new T.Color(colors[i%5]));
  this.materials.push(this.sprinkles.material);this.sprinkles.instanceColor.needsUpdate=true;
  this.flavor=0;
 }
 resize(w,h,dpr=1){this.w=w;this.h=h;this.renderer.setPixelRatio(dpr);this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 draw(state){
  const s=M.pose(state.p),small=this.w<760,aspect=this.w/this.h,unitH=7.37,unitW=unitH*aspect;
  const reveal=state.flavors?1:s.reveal;
  const cx=small?(state.flavors?unitW*.265:0):unitW*.23*reveal,cy=small?(state.flavors?-.55:this.h<700?-1.55:-1.23):.05;
  const burst=state.still?0:Math.max(s.burst,(state.transition||0)*.9);
  this.camera.position.set((state.pointer?.x||0)*.12,(state.pointer?.y||0)*.06,9.6-s.dolly*1.55);
  this.camera.lookAt((state.pointer?.x||0)*.04,0,0);
  this.actor.position.set(cx,cy,.03+s.dolly*.25);this.actor.rotation.set(0,(state.pointer?.x||0)*.075,Math.sin(state.time*.55)*.012+s.spin*.025);
  this.actor.scale.setScalar((small?(state.flavors?.40:this.h<700?.5:.56):1)*(1-burst*.16)*(1-(state.transition||0)*.35));
  const atlas=state.flavors&&state.flavor!==0;
  this.flavorProduct.visible=atlas;this.layers.forEach(m=>m.visible=!atlas);
  if(atlas){this.flavorProduct.material.map=this.flavorMaps[state.flavor];this.flavorProduct.material.opacity=1-(state.transition||0)*.6;}
  this.layers.forEach((mesh,i)=>{mesh.position.set(i<4?Math.sin(i*2.5)*burst*.85:0,mesh.userData.baseY+(i<4?(4-i)*burst*.18:0),i<4?Math.sin(i)*burst*.4:0);mesh.rotation.z=i<4?Math.sin(i)*burst*.13:0;});
  const ids=state.ingredients||[6,7,3];
  const ingredientP=state.flavors?.14+burst*.3:state.p;
  this.ingredients.forEach((mesh,i)=>{
   mesh.visible=i<Math.round(M.mix(small?5:8,small?16:28,burst));const a=M.ingredient(i,ingredientP,state.time,aspect);
   const z=a.z,x=cx+a.x*(small?.52:1),y=cy+a.y*(small?.57:1);
   mesh.position.set(x,y,z);mesh.rotation.set(Math.sin(i+state.time*.2)*.18,Math.sin(i*2+state.time*.15)*.28,a.rotation);
   mesh.scale.setScalar(a.size*(small?.65:1)*M.mix(.65,1,burst));mesh.material.map=this.ingredientMaps[ids[i%ids.length]];
   mesh.material.opacity=(state.still?.8:M.mix(.84,.98,burst))*(state.flavors?.75:1);
   if(mesh.material.userData.defocus)mesh.material.userData.defocus.value=Math.max(0,z-1.35)*burst*6;
  });
  this.sauceMaterial.color.set(state.sauce||0x6a2715);this.sauceMaterial.opacity=burst*.88;this.creamMaterial.opacity=burst*.9;
  this.ribbons.forEach((mesh,i)=>{mesh.visible=burst>.008;mesh.position.set(cx,cy-.15,-.3);mesh.scale.setScalar((small?.55:1)*(.25+burst*.9));mesh.rotation.set(Math.sin(state.time*.1+i)*.15,s.spin*.5,Math.sin(state.p*2)*.17);});
  const d=this.dummy;
  for(let i=0;i<70;i++){
   const a=i*2.399963+state.time*.08,r=(1.15+(i%7)*.26)*(1+burst*1.5),z=Math.sin(i*2)*1.7*burst;
   d.position.set(cx+Math.cos(a)*r*(small?.45:1),cy+Math.sin(a)*r*.75+(Math.sin(state.time*.3+i)*.1),z);
   d.rotation.set(i+state.time*.2,state.time*.25+i,a);d.scale.setScalar(state.still?0:small?.7:1);d.updateMatrix();this.sprinkles.setMatrixAt(i,d.matrix);
  }this.sprinkles.instanceMatrix.needsUpdate=true;
  for(let i=0;i<26;i++){
   const a=i*2.4,r=(2+i%3)*burst;
   d.position.set(cx+Math.cos(a)*r*(small?.6:1),cy+Math.sin(a)*r*.7,Math.sin(i)*1.5);
   d.scale.set(burst*.55,burst*(1.1+Math.sin(i)*.3),burst*.55);d.rotation.set(0,0,a);d.updateMatrix();this.drops.setMatrixAt(i,d.matrix);
  }this.drops.instanceMatrix.needsUpdate=true;this.renderer.render(this.scene,this.camera);
 }
 dispose(){this.scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});this.materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());this.renderer.dispose();}
}
