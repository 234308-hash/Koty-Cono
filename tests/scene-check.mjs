import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const M=require('../assets/cinematic/cinema-math.js');
globalThis.window={KotyCinemaMath:M};
const {CinemaWebGL}=await import('../assets/cinematic/cinema-webgl.js');
class Renderer{
 setClearColor(){}setPixelRatio(){}setSize(){}dispose(){}
 render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld();scene.traverse(o=>{assert(o.position.toArray().every(Number.isFinite));assert(o.scale.toArray().every(Number.isFinite));});}
}
const assets={cone:{width:320,height:480},ingredients:{width:1774,height:887},flavors:{width:1536,height:1024}};
for(const [width,height] of [[1440,900],[1024,768],[768,1024],[390,844],[360,640]]){
 const scene=new CinemaWebGL(null,assets,Renderer);scene.resize(width,height,1);
 for(let frame=0;frame<=198;frame++){
  const p=frame/198,s=M.pose(p);assert(s.burst>=0&&s.burst<=1);scene.draw({p,time:frame/30,flavors:false,flavor:0,ingredients:[6,7,3],transition:0,pointer:{x:0,y:0}});
  // Cone base remains a single rigid plane and all cream slices converge exactly.
  assert.equal(scene.layers[4].rotation.z,0);assert.equal(scene.layers[4].position.x,0);
 }
 scene.draw({p:1,time:7,flavors:false,flavor:0,ingredients:[6,7,3],transition:0,pointer:{x:0,y:0}});
 scene.layers.forEach(layer=>{assert.equal(layer.position.y,layer.userData.baseY);assert(Math.abs(layer.position.x)<1e-9);assert(Math.abs(layer.rotation.z)<1e-9);});
 for(let flavor=0;flavor<6;flavor++)for(const transition of [0,.5,1]){scene.draw({p:1,time:2,flavors:true,flavor,ingredients:[1,2,0],sauce:0x9b2854,transition,pointer:{x:.7,y:-.3}});assert.equal(scene.flavorProduct.visible,flavor!==0);if(flavor!==0)assert.equal(scene.flavorProduct.material.map,scene.flavorMaps[flavor]);}
 scene.dispose();
}
assert.equal(M.pose(0).burst,0);assert.equal(M.pose(1).burst,0);assert.equal(M.pose(1).reveal,1);assert(M.pose(.4).burst>.95);
console.log('PASS: 199-frame choreography at five viewport sizes, finite geometry/transforms, rigid cone, exact reassembly, six product texture selections, depth and sauce transitions. GPU pixels were not rendered.');
