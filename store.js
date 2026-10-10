(function(root){
'use strict';
const products=[
 {id:'vanilla',name:'Rainbow Vanilla',category:'cones',price:9500,image:'vanilla',tag:'The original',description:'Silky vanilla, a crisp waffle cone and a joyful shower of rainbow sprinkles.',ingredients:'Vanilla dairy ice cream, waffle cone, candy sprinkles.',allergens:'Milk, wheat. Sprinkles may contain soy.'},
 {id:'chocolate',name:'Cocoa Crush',category:'cones',price:11000,image:'chocolate',tag:'Chocolate mood',description:'Deep cocoa flavor, dreamy chocolate folds and delicate chocolate shavings.',ingredients:'Chocolate dairy ice cream, waffle cone, chocolate shavings.',allergens:'Milk, wheat, soy.'},
 {id:'strawberry',name:'Strawberry Kiss',category:'cones',price:10500,image:'strawberry',tag:'Fruity favorite',description:'A pretty pink swirl with strawberry pieces and a bright, fruity finish.',ingredients:'Strawberry dairy ice cream, waffle cone, strawberry pieces.',allergens:'Milk, wheat.'},
 {id:'pistachio',name:'Pistachio Dream',category:'cones',price:13500,image:'pistachio',tag:'A nutty little treat',description:'Creamy pistachio, a golden cone and a sprinkle of chopped pistachios.',ingredients:'Pistachio dairy ice cream, waffle cone, chopped pistachios.',allergens:'Milk, wheat, pistachio (tree nuts).'},
 {id:'mango',name:'Mango Sunshine',category:'cups',price:10000,image:'mango',tag:'Sunshine in a cup',description:'Golden mango goodness with fresh mango pieces. A little cup of summer.',ingredients:'Mango dairy ice cream, mango pieces.',allergens:'Milk.'},
 {id:'berry',name:'Berry Happy',category:'cups',price:11500,image:'berry',tag:'A berry good idea',description:'A bright berry scoop finished with blueberries and raspberries.',ingredients:'Mixed berry dairy ice cream, blueberries, raspberries.',allergens:'Milk.'},
 {id:'duo',name:'Rainbow Duo',category:'bundles',price:18500,image:'vanilla',image2:'strawberry',tag:'Made to share',description:'One Rainbow Vanilla and one Strawberry Kiss. Two cones, twice the happy.',ingredients:'Two regular cones: vanilla with sprinkles, and strawberry.',allergens:'Milk, wheat. Sprinkles may contain soy.'},
 {id:'cup-trio',name:'Happy Cup Trio',category:'bundles',price:30000,image:'mango',image2:'berry',tag:'Bring your people',description:'Two Mango Sunshine cups and one Berry Happy cup, ready for a little get-together.',ingredients:'Two mango cups and one mixed berry cup.',allergens:'Milk.'}
];
const sizes={regular:{label:'Regular',extra:0},large:{label:'Large',extra:2500}};
const toppings={none:{label:'As pictured',extra:0},sprinkles:{label:'Extra sprinkles',extra:1000},chocolate:{label:'Chocolate drizzle',extra:1500},nuts:{label:'Crushed nuts',extra:2000}};
const cities={Cairo:5000,Giza:5500,Alexandria:7500,Mansoura:6500};
const find=id=>products.find(p=>p.id===id);
const key=(id,size,topping)=>[id,size,topping].join(':');
function normalize(lines){
 if(!Array.isArray(lines))return [];
 const result=[];
 for(const item of lines.slice(0,50)){
  const p=find(item?.id);if(!p)continue;
  const size=p.category==='bundles'?'regular':Object.hasOwn(sizes,item.size)?item.size:'regular';
  const topping=p.category==='bundles'?'none':Object.hasOwn(toppings,item.topping)?item.topping:'none';
  const qty=Math.min(10,Math.max(0,Math.floor(Number(item.qty)||0)));if(!qty)continue;
  const k=key(p.id,size,topping),existing=result.find(x=>x.key===k);
  if(existing)existing.qty=Math.min(10,existing.qty+qty);else result.push({id:p.id,size,topping,qty,key:k});
 }
 return result;
}
function unitPrice(item){const p=find(item.id);return p.price+sizes[item.size].extra+toppings[item.topping].extra;}
function calculate(lines,{city='Cairo',coupon=''}={}){
 const cart=normalize(lines),subtotal=cart.reduce((sum,line)=>sum+unitPrice(line)*line.qty,0);
 const discount=coupon==='KOTY10'?Math.round(subtotal*.1):0;
 const delivery=subtotal===0||subtotal>=35000?0:(cities[city]??cities.Cairo);
 return {subtotal,discount,delivery,total:subtotal-discount+delivery,count:cart.reduce((s,l)=>s+l.qty,0),freeDelivery:subtotal>=35000};
}
function add(lines,id,{size='regular',topping='none',qty=1}={}){
 if(!find(id))throw new Error('Unknown product');
 return normalize([...normalize(lines),{id,size,topping,qty}]);
}
function setQty(lines,k,qty){return normalize(normalize(lines).map(x=>x.key===k?{...x,qty}:x));}
function validateCustomer(c){
 const errors=[];
 if(typeof c.name!=='string'||c.name.trim().length<2)errors.push('Please add your full name.');
 const phone=String(c.phone||'').replace(/[\s()-]/g,'');
 if(!/^(?:\+20|20|0)?1[0125]\d{8}$/.test(phone))errors.push('Please enter a valid Egyptian mobile number.');
 if(!Object.hasOwn(cities,c.city))errors.push('Please choose a listed city.');
 if(typeof c.area!=='string'||!c.area.trim())errors.push('Please add your area.');
 if(typeof c.address!=='string'||c.address.trim().length<5)errors.push('Please add your street and building details.');
 if(!['cash','card','wallet'].includes(c.payment))errors.push('Please choose a payment method.');
 if(!c.agreement)errors.push('Please acknowledge the demo checkout notice.');
 if(c.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))errors.push('Please check your email address.');
 return errors;
}
const api={products,sizes,toppings,cities,find,key,normalize,unitPrice,calculate,add,setQty,validateCustomer};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
else root.KotyStore=api;
})(typeof window!=='undefined'?window:globalThis);
