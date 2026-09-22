import { LANDMARK_SITES } from './landmark-sites.js';
const settlementSites=Object.values(LANDMARK_SITES).filter(site=>site.ground!==undefined);
// Deterministic, reference-inspired relief. Map units are not surveyed metres.
export const BOUNDS = { minX:-10, maxX:16, minZ:-7, maxZ:13 };
export const WIDTH=BOUNDS.maxX-BOUNDS.minX, DEPTH=BOUNDS.maxZ-BOUNDS.minZ;
export const CENTER_X=(BOUNDS.minX+BOUNDS.maxX)/2, CENTER_Z=(BOUNDS.minZ+BOUNDS.maxZ)/2;
const clamp = (v, lo=0, hi=1) => Math.max(lo, Math.min(hi, v));
const smooth = (a,b,v) => { const t=clamp((v-a)/(b-a)); return t*t*(3-2*t); };
function hash(x,z) {
  let h=Math.imul(x,374761393)^Math.imul(z,668265263);
  h=Math.imul(h^(h>>>13),1274126177);
  return ((h^(h>>>16))>>>0)/4294967295;
}
export function noise(x,z) {
  const ix=Math.floor(x), iz=Math.floor(z);
  const fx=x-ix, fz=z-iz, u=fx*fx*(3-2*fx), v=fz*fz*(3-2*fz);
  const a=hash(ix,iz), b=hash(ix+1,iz), c=hash(ix,iz+1), d=hash(ix+1,iz+1);
  return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;
}
const ridges = [
  {points:[[7.0,-4.95],[8.05,-4.6],[9,-4.8],[10.05,-4.32]],width:.55,height:.66}, // Iron Hills
  {points:[[10.1,2.55],[9.7,3.35],[9,4.25],[8.55,4.95]],width:.26,height:.8}, // interior Mordor spur
  {points:[[-1.1,-6],[-.72,-4.7],[-.8,-3.8],[-.48,-2.5],[-.65,-1.6],[-.95,-.4],[-1.15,.8],[-1.4,1.35]], width:.43, height:1.35},
  {points:[[-4.7,3.6],[-3.7,3.28],[-2.8,3.35],[-1.7,3.58],[-.5,3.6],[.7,4.04],[2.4,4.4]], width:.4, height:1.12},
  {points:[[4.12,2.58],[4.43,3.25],[4.36,4.35],[4.55,5.35],[4.65,6.8],[4.95,8.0]], width:.29, height:.96},
  {points:[[4.12,2.58],[5.4,2.23],[6.7,2.32],[8.2,2.2],[10.1,2.55],[12.6,2.7]], width:.32, height:.98},
  {points:[[4.95,8.0],[6.6,8.24],[8.6,8.04],[10.7,7.8],[12.25,7.5]], width:.29, height:.8},
  {points:[[-8,-6],[-7.8,-4.3],[-8.25,-3.0]], width:.34, height:.86},
  {points:[[-7.75,-1.85],[-7.4,-.9],[-7.35,.0]], width:.28, height:.66},
  {points:[[-1.1,-5.8],[.5,-5.7],[1.8,-5.95],[3.15,-5.65],[4,-5.8]], width:.34, height:.88}
];
export function segmentDistance(x,z,a,b) {
  const dx=b[0]-a[0], dz=b[1]-a[1];
  const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz));
  return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
}
// Gulf of Lune, western river mouths and a more indented southern coast.
export function coast(z) {
  if(z>5.3) {
    // Bay of Belfalas gives way to the Harad coast; preserve the southern Anduin estuary.
    const anchors=[[5.3,-5.56],[6.4,-2.9],[7.2,.35],[8.5,.1],[10,-.25],[11.5,.6],[13,.9]];
    let i=1;while(i<anchors.length-1&&z>anchors[i][0])i++;
    const a=anchors[i-1],b=anchors[i],t=(z-a[0])/(b[0]-a[0]);
    return a[1]+(b[1]-a[1])*t+.09*Math.sin(z*5);
  }
  return -8.85 + Math.max(0,z+.9)*.49
    + .92*Math.exp(-(((z+2.3)/.43)**2))
    + .36*Math.exp(-(((z-1.7)/.4)**2))
    + .52*Math.exp(-(((z-4.9)/.6)**2))
    + .14*Math.sin(z*2.7) + .08*Math.sin(z*6.1);
}
export function mordorMask(x,z) {
  const west=4.22+Math.max(0,z-3)*.13;
  const north=2.30+.09*Math.sin(x*1.9);
  return smooth(west-.38,west+.25,x)*smooth(north-.18,north+.4,z)*(1-smooth(7.8,8.55,z))*(1-smooth(12,13.4,x));
}
export function elevation(x,z) {
  const inland=x-coast(z);
  if(inland<0) return -.08+Math.max(-.35,inland*.13);
  const broad=noise(x*.65+20,z*.65+13), detail=noise(x*4.8,z*4.8);
  let h=.1+.13*broad+.035*detail;
  // Warped ridges and several scales of relief avoid a regular sawtooth pattern.
  const wx=x+(noise(x*1.5+31,z*1.5)-.5)*.19;
  const wz=z+(noise(x*1.4,z*1.4+71)-.5)*.19;
  let mountains=0;
  const crags=.66+.25*noise(x*3.7+8,z*3.7)+.17*noise(x*10.3,z*10.3);
  for(const ridge of ridges) {
    let d=Infinity;
    for(let i=1;i<ridge.points.length;i++) d=Math.min(d,segmentDistance(wx,wz,ridge.points[i-1],ridge.points[i]));
    const core=Math.exp(-((d/ridge.width)**2));
    const foothills=Math.exp(-((d/(ridge.width*2.8))**2));
    mountains=Math.max(mountains,ridge.height*(core*crags+foothills*(.13+.12*detail)));
  }
  // Nan Curunír is a valley below Methedras, not a ridge-top settlement.
  const isengardValley=Math.exp(-(((x+1.75)/.48)**2+((z-1.9)/.64)**2));
  const morgulVale=Math.exp(-(((x-3.98)/.35)**2+((z-4.48)/.28)**2));
  const morannonPass=Math.exp(-(((x-4.15)/.38)**2+((z-2.55)/.30)**2));
  h+=mountains*(1-.96*isengardValley)*(1-.84*morgulVale)*(1-.82*morannonPass);
  h+=1.7*Math.exp(-((x-4.55)**2+(z+4.7)**2)/.13);
  const volcano=Math.hypot(x-5.35,z-3.45);
  h+=1.12*Math.exp(-((volcano/.36)**2))-.3*Math.exp(-((volcano/.10)**2));
  h+=.18*Math.exp(-((x-2.4)**2+(z-1.7)**2)/.65)*(.5+detail);
  h+=.045*mordorMask(x,z)*noise(x*13,z*13);
  // Keep Núrnen's water surface above a shallow, level basin.
  const lakeRadius=Math.hypot((x-8)/1.18,(z-6.12)/.55);
  const lakeBasin=1-smooth(1.08,1.3,lakeRadius);
  h=h*(1-lakeBasin)+.12*lakeBasin;
  // Flat settlement footprints blend back into surrounding hills. The same field
  // feeds the mesh, texture, exports and buildings, so there are no floating pads.
  for(const site of settlementSites) {
    if(Math.abs(x-site.x)>site.radius||Math.abs(z-site.z)>site.radius)continue;
    const d=Math.hypot(x-site.x,z-site.z);
    const blend=1-smooth(site.radius*.7,site.radius,d);
    h=h*(1-blend)+site.ground*blend;
  }
  return h*smooth(0,.26,inland);
}
// sRGB palette shared by the baked surface texture and palette tests.
export function terrainColor(x,z,h) {
  const n=noise(x*2.3+40,z*2.3), fine=noise(x*22,z*22);
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*clamp(t));
  if(h<0) return mix([22,48,66],[46,87,99],smooth(-.22,0,h));
  let color=mix([57,83,46],[118,126,71],n*.8+Math.max(0,z)*.035);
  const dry=smooth(6.8,10,z)*(1-mordorMask(x,z));
  color=mix(color,[161,137,87],dry*.85);
  const forest=Math.exp(-(((x-2.25)/1.05)**4)-(((z+2.65)/2.4)**4));
  color=mix(color,[35,61,39],forest*.7);
  color=mix(color,[105,109,99],smooth(.37,1.02,h));
  color=mix(color,[224,229,220],smooth(.95,1.58,h));
  // Apply Mordor LAST so elevation never turns its mountains grassy or snowy.
  const ash=mix([19,22,24],[58,57,57],smooth(.15,1.5,h));
  const nurn=smooth(5.25,6.15,z)*(1-smooth(7.25,8,z));
  color=mix(color,mix(ash,[46,53,37],nurn*.6),mordorMask(x,z));
  return color.map(v=>clamp(v*(.94+fine*.12),0,255));
}
export { rivers } from './geography.js';
export function sampleHeightmap(size=256) {
  const values=new Float32Array(size*size);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) values[y*size+x]=elevation(BOUNDS.minX+x/(size-1)*WIDTH,BOUNDS.minZ+y/(size-1)*DEPTH);
  return values;
}
