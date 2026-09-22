import * as THREE from 'three';
import { createLandmarks } from './landmarks.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { locations, journeys, events, regions } from './data.js';
import { geographyEntries, localPlaces, localAreas, lakes, roads, detailLevel } from './geography.js';
const atlasEntries=[...locations,...geographyEntries];
import { WIDTH, DEPTH, BOUNDS, CENTER_X, CENTER_Z, elevation, terrainColor, rivers, sampleHeightmap } from './terrain.js';

const $ = selector => document.querySelector(selector);
const mapElement = $('#map');
const panel = $('#lore-panel');
let lastSelection;
let closeSearchDropdown = () => false;
function openLore(data, origin = document.activeElement) {
  closeSearchDropdown();
  lastSelection = origin;
  $('#lore-type').textContent = data.type;
  $('#lore-name').textContent = data.name;
  $('#lore-region').textContent = data.region;
  $('#lore-description').textContent = data.description;
  $('#lore-reading').textContent = data.reading;
  $('#lore-source').href = data.source;
  $('#lore-source').textContent=`Read more at ${new URL(data.source).hostname.includes('glyphweb')?'The Encyclopedia of Arda':'Tolkien Gateway'} ↗`;
  const related = events.filter(event => event.place === data.id);
  $('#lore-facts').replaceChildren();
  for (const event of related) {
    const button = document.createElement('button');
    button.className = 'event-entry';
    button.textContent = `${event.date} · ${event.name}`;
    button.onclick = () => openLore(event, origin);
    $('#lore-facts').append(button);
  }
  panel.inert = false;
  panel.classList.add('is-open');
  $('#close-lore').focus({preventScroll:true});
}
function closeLore() {
  panel.classList.remove('is-open');
  panel.inert = true;
  if (lastSelection?.isConnected) lastSelection.focus({preventScroll:true});
}
$('#close-lore').onclick = closeLore;
window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (closeSearchDropdown()) return;
    closeLore();
  }
});
$('#location-count').textContent = atlasEntries.length;
let focusPlace = () => {};
function populateIndex() {
  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
  const query = normalize($('#place-search').value.trim());
  const matches = atlasEntries.filter(p => normalize(`${p.name} ${p.region} ${(p.aliases||[]).join(' ')}`).includes(query));
  $('#place-results').replaceChildren();
  for(const place of matches) {
    const button = document.createElement('button');
    button.textContent = place.name;
    button.onclick = () => { focusPlace(place, true); openLore(place,button); };
    $('#place-results').append(button);
  }
  if(!matches.length) $('#place-results').textContent = 'No places found. Try a region such as Rohan.';
  $('#search-count').textContent = `${matches.length} entries`;
}
$('#place-search').addEventListener('input',populateIndex);
populateIndex();

function start() {
  let frame = 0, animationTimer=0, contextLost = false, mapVisible=true;
  let lastViewKey='';
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  function invalidate() {
    if (!frame && !contextLost && !document.hidden && mapVisible) frame = requestAnimationFrame(render);
  }
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#152c30');
  const camera = new THREE.PerspectiveCamera(38,1,.1,250);
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','Middle-earth relief map. Use the place index to select locations with a keyboard.');
  mapElement.append(renderer.domElement);
  const controls = new OrbitControls(camera,renderer.domElement);
  controls.addEventListener('start', () => { closeSearchDropdown(); });
  mapElement.addEventListener('wheel', () => { closeSearchDropdown(); }, { passive: true });
  controls.enableDamping = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.minDistance = 2.8;
  controls.maxDistance = 42;
  controls.maxPolarAngle = Math.PI*.43;
  controls.minPolarAngle = 0;
  controls.target.set(0,0,0);
  scene.add(new THREE.HemisphereLight(0xe1e9f0,0x273026,1.6));
  const sun = new THREE.DirectionalLight(0xfff2dc,2.1);
  sun.position.set(-8,12,-5);
  scene.add(sun);
  let relief = 1;
  const terrainGroup = new THREE.Group();
  scene.add(terrainGroup);
  const geometry = new THREE.PlaneGeometry(WIDTH,DEPTH,224,172);
  geometry.rotateX(-Math.PI/2);
  geometry.translate(CENTER_X,0,CENTER_Z);
  const positions = geometry.attributes.position;
  for(let i=0;i<positions.count;i++) positions.setY(i,elevation(positions.getX(i),positions.getZ(i)));
  geometry.computeVertexNormals();
  // Bake fine color and relief once; details do not require extra geometry per frame.
  const textureWidth=960, textureHeight=738;
  const canvas=document.createElement('canvas');
  canvas.width=textureWidth; canvas.height=textureHeight;
  const context=canvas.getContext('2d'), pixels=context.createImageData(textureWidth,textureHeight);
  const heights=new Float32Array(textureWidth*textureHeight);
  for(let y=0;y<textureHeight;y++) for(let x=0;x<textureWidth;x++) {
    heights[y*textureWidth+x]=elevation(BOUNDS.minX+x/(textureWidth-1)*WIDTH,BOUNDS.minZ+y/(textureHeight-1)*DEPTH);
  }
  for(let y=0;y<textureHeight;y++) for(let x=0;x<textureWidth;x++) {
    const i=y*textureWidth+x, h=heights[i];
    const color=terrainColor(BOUNDS.minX+x/(textureWidth-1)*WIDTH,BOUNDS.minZ+y/(textureHeight-1)*DEPTH,h);
    const dx=heights[y*textureWidth+Math.min(x+1,textureWidth-1)]-heights[y*textureWidth+Math.max(x-1,0)];
    const dz=heights[Math.min(y+1,textureHeight-1)*textureWidth+x]-heights[Math.max(y-1,0)*textureWidth+x];
    const shade=h<0?1:THREE.MathUtils.clamp(.92+(dx+dz)*2.7,.62,1.12);
    pixels.data.set([...color.map(v=>Math.round(v*shade)),255],i*4);
  }
  context.putImageData(pixels,0,0);
  const surface=new THREE.CanvasTexture(canvas);
  surface.colorSpace=THREE.SRGBColorSpace;
  surface.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  terrainGroup.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:surface,roughness:1})));
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(WIDTH,.4,DEPTH),new THREE.MeshStandardMaterial({color:0x263b35,roughness:1}));
  plinth.position.set(CENTER_X,-.72,CENTER_Z); terrainGroup.add(plinth);

  const point = (x,z,offset=.065) => new THREE.Vector3(x,Math.max(0,elevation(x,z))+offset,z);
  function surfacePath(points,offset=.07,smooth=false) {
    if(smooth) {
      const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
      const length=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);
      return curve.getPoints(Math.max(8,Math.ceil(length/.035))).map(p=>point(p.x,p.z,offset));
    }
    const sampled=[];
    for(let i=1;i<points.length;i++) {
      const a=points[i-1], b=points[i];
      const count=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.035));
      for(let j=0;j<count;j++) {
        const t=j/count;
        sampled.push(point(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,offset));
      }
    }
    const end=points.at(-1); sampled.push(point(...end,offset));
    return sampled;
  }
  function ribbon(points,color,radius,offset,smooth=false) {
    const samples=surfacePath(points,offset,smooth), vertices=[], indices=[];
    // Two vertices per sample instead of tube rings and CurvePath length scans.
    for(let i=0;i<samples.length;i++) {
      const prev=samples[Math.max(0,i-1)],next=samples[Math.min(samples.length-1,i+1)];
      const dx=next.x-prev.x,dz=next.z-prev.z,length=Math.hypot(dx,dz)||1;
      const nx=-dz/length*radius,nz=dx/length*radius,p=samples[i];
      for(const side of [-1,1]) {
        const x=p.x+nx*side,z=p.z+nz*side;
        vertices.push(x,Math.max(0,elevation(x,z))+offset,z);
      }
      if(i>0){const n=i*2;indices.push(n-2,n-1,n,n-1,n+1,n);}
    }
    const mesh=new THREE.BufferGeometry();
    mesh.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));mesh.setIndex(indices);
    return new THREE.Mesh(mesh,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
  }
  const detailMeshes=[];
  // Batch waterways by reveal tier: a whole river tier is one draw call.
  function batchRibbons(items,color,width,offset,level,smooth=true) {
    const positions=[],indices=[];
    for(const item of items) {
      const strip=ribbon(item.points,color,item.width||width,offset,smooth);
      const start=positions.length/3;
      positions.push(...strip.geometry.attributes.position.array);
      for(const index of strip.geometry.index.array) indices.push(index+start);
      strip.geometry.dispose();strip.material.dispose();
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);
    const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
    terrainGroup.add(mesh);detailMeshes.push({mesh,level});
  }
  for(let level=0;level<=2;level++) {
    batchRibbons(rivers.filter(r=>r.level===level),0x72bbc9,.015,.055,level);
    batchRibbons(roads.filter(r=>r.level===level),0xc0af7d,.009,.04,level);
  }
  // Lakes are densely draped cartographic polygons, matching the schematic relief.
  for(const lake of lakes) {
    const vertices=[],indices=[],segments=64,rings=10;
    vertices.push(lake.x,elevation(lake.x,lake.z)+.045,lake.z);
    for(let ring=1;ring<=rings;ring++) for(let i=0;i<segments;i++) {
      const a=i/segments*Math.PI*2,r=ring/rings*(1+.07*Math.sin(a*5));
      const x=lake.x+Math.cos(a)*lake.rx*r,z=lake.z+Math.sin(a)*lake.rz*r;
      vertices.push(x,elevation(x,z)+.045,z);
      const current=1+(ring-1)*segments+i,next=1+(ring-1)*segments+(i+1)%segments;
      if(ring===1) indices.push(0,current,next);
      else indices.push(current-segments,current,next,current-segments,next,next-segments);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);
    terrainGroup.add(new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0x397c93,side:THREE.DoubleSide})));
  }
  const routeGroups={};
  for(const [key,route] of Object.entries(journeys)) {
    const coords=route.points.map(id=>{const p=locations.find(p=>p.id===id);return [p.x,p.z];});
    const group=new THREE.Group();
    group.add(ribbon(coords,route.color,.025,.12));
    routeGroups[key]=group;
    terrainGroup.add(group);
  }
  // Instanced forest silhouettes add woodland scale without hundreds of draw calls.
  let seed=37;
  const random=()=> { seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; };
  const trees=[];
  for(const [cx,cz,rx,rz,count] of [[2.25,-2.65,1.1,2.3,290],[.15,1.2,.7,.5,65],[.25,-.3,.55,.45,45],[-5.5,-1.9,.28,.35,20]]) {
    for(let i=0;i<count;i++) {
      const angle=random()*Math.PI*2,r=Math.sqrt(random());
      const x=cx+Math.cos(angle)*r*rx,z=cz+Math.sin(angle)*r*rz;
      trees.push([x,z,.07+random()*.12]);
    }
  }
  const forest=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,5),new THREE.MeshStandardMaterial({color:0x294d3c,roughness:1}),trees.length);
  const dummy=new THREE.Object3D();
  trees.forEach(([x,z,size],i)=> {dummy.position.set(x,elevation(x,z)+size*.5,z); dummy.scale.set(size*.45,size,size*.45); dummy.updateMatrix();forest.setMatrixAt(i,dummy.matrix);});
  terrainGroup.add(forest);
  const eventGroup=new THREE.Group(); terrainGroup.add(eventGroup);
  const landmarks=createLandmarks(atlasEntries,elevation);
  scene.add(landmarks.root);
  window.__landmarks=landmarks;
  window.__camera=camera;
  window.__controls=controls;
  $('#cinematic-mode').checked=false;
  const qualityStatus=$('#quality-status');
  function syncQuality(){
    landmarks.setEnhanced($('#cinematic-mode').checked);
    qualityStatus.textContent=landmarks.enhanced?(reducedMotion.matches?'Detailed models · motion reduced':'Detailed models + particles'):'Low-poly · effects off';
    clearTimeout(animationTimer);invalidate();
  }
  $('#cinematic-mode').addEventListener('change',syncQuality);
  reducedMotion.addEventListener('change',()=>{controls.enableDamping=!reducedMotion.matches;syncQuality();});
  const hitObjects=[];
  const labels=[];
  const labelLayer=$('#map-labels');
  function addLabel(data,isEvent=false) {
    const button=document.createElement('button');
    button.className=`place-label${isEvent?' event-label':''}${data.area?' area-label':''}${data.type==='River'||data.type==='Lake'?' water-label':''}${data.level?' local-label':''}`;
    button.dataset.feature=data.id;
    button.dataset.level=data.level||0;
    button.textContent=isEvent?'✦':data.name;
    button.title=isEvent?`${data.name} · ${data.date}`:data.name;
    button.setAttribute('aria-label',isEvent?button.title:`Explore ${data.name}`);
    button.onclick=()=>openLore(data,button);
    button.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' ') {
        e.preventDefault();
        openLore(data,button);
      }
    });
    labelLayer.append(button);
    labels.push({button,data,isEvent,height:Math.max(0,elevation(data.x,data.z))+.19});
  }
  const landmarkIdSet=new Set(landmarks.records.map(r=>r.data.id));
  const pinMeshes=[];
  const eventMeshes=[];
  const pinGeometry=new THREE.SphereGeometry(.067,8,6), pinMaterial=new THREE.MeshBasicMaterial({color:0xffe8ad});
  for(const location of [...locations,...localPlaces]) {
    addLabel(location);
    if(landmarkIdSet.has(location.id)) continue;
    const marker=new THREE.Mesh(pinGeometry,pinMaterial);
    marker.position.copy(point(location.x,location.z,.13));
    marker.userData.entry=location;
    terrainGroup.add(marker);
    hitObjects.push(marker);
    pinMeshes.push({mesh:marker,level:location.level||0,pos:marker.position});
  }
  const eventGeometry=new THREE.OctahedronGeometry(.09),eventMaterial=new THREE.MeshBasicMaterial({color:0xeadca6});
  for(const event of events) {
    const marker=new THREE.Mesh(eventGeometry,eventMaterial);
    marker.position.copy(point(event.x,event.z,.17));
    marker.userData.entry=event;
    eventGroup.add(marker);
    hitObjects.push(marker);
    addLabel(event,true);
    eventMeshes.push(marker);
  }
  for(const data of [...localAreas,...rivers,...lakes])addLabel(data);
  for(const [name,x,z] of regions) {
    const element=document.createElement('span');element.className='region-label';element.textContent=name;
    labelLayer.append(element);labels.push({button:element,data:{x,z},region:true,height:Math.max(0,elevation(x,z))+.08});
  }
  const prominent=new Set(['bag-end','rivendell','minas-tirith','isengard','osgiliath','minas-morgul','black-gate','nurnen','iron-hills','south-gondor','near-harad','khand','harad']);
  labels.sort((a,b)=>Number(prominent.has(b.data.id))-Number(prominent.has(a.data.id)));
  function syncLayers() {
    for(const input of document.querySelectorAll('[data-layer]')) {
      input.closest('.layer-toggle').classList.toggle('is-active',input.checked);
      if(input.dataset.layer==='events') eventGroup.visible=input.checked;
      else routeGroups[input.dataset.layer].visible=input.checked;
    }
    invalidate();
  }
  document.querySelectorAll('[data-layer]').forEach(input=>input.addEventListener('change',syncLayers));
  syncLayers();

  // 3D Highlight Beacon for searched/selected locations
  const highlightGroup=new THREE.Group();
  highlightGroup.name='Search Highlight';
  highlightGroup.visible=false;
  scene.add(highlightGroup);

  const beaconRingGeom=new THREE.RingGeometry(.12,.18,32);
  beaconRingGeom.rotateX(-Math.PI/2);
  const beaconRingMat=new THREE.MeshBasicMaterial({color:0xd6a650,side:THREE.DoubleSide,transparent:true,opacity:.9,depthWrite:false});
  const beaconRing=new THREE.Mesh(beaconRingGeom,beaconRingMat);
  highlightGroup.add(beaconRing);

  const pulseRingGeom=new THREE.RingGeometry(.04,.09,32);
  pulseRingGeom.rotateX(-Math.PI/2);
  const pulseRingMat=new THREE.MeshBasicMaterial({color:0xffe29a,side:THREE.DoubleSide,transparent:true,opacity:.8,depthWrite:false});
  const pulseRing=new THREE.Mesh(pulseRingGeom,pulseRingMat);
  highlightGroup.add(pulseRing);

  const pillarGeom=new THREE.CylinderGeometry(.05,.14,1.8,24,1,true);
  const pillarMat=new THREE.MeshBasicMaterial({color:0xf6d376,side:THREE.DoubleSide,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending});
  const pillar=new THREE.Mesh(pillarGeom,pillarMat);
  pillar.position.y=.9;
  highlightGroup.add(pillar);

  let highlightedTarget=null;

  function clearHighlight() {
    highlightedTarget=null;
    highlightGroup.visible=false;
    for(const l of labels) l.button.classList.remove('is-highlighted');
    lastViewKey='';
    invalidate();
  }

  function setHighlight(place) {
    highlightedTarget=place;
    highlightGroup.position.set(place.x,(Math.max(0,elevation(place.x,place.z))+.04)*relief,place.z);
    highlightGroup.visible=true;
    for(const l of labels) l.button.classList.toggle('is-highlighted',l.data.id===place.id);
    lastViewKey='';
    invalidate();
  }

  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
  let press=null;
  let downLabel=null;
  let hoveredLabel=null;

  function findLabelUnderPoint(clientX, clientY) {
    for (let i = labels.length - 1; i >= 0; i--) {
      const item = labels[i];
      if (item.region || !item.button) continue;
      if (item.button.style.visibility === 'hidden') continue;
      const rect = item.button.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return item;
      }
    }
    return null;
  }

  renderer.domElement.addEventListener('pointermove', e => {
    if (e.buttons === 0) {
      const target = findLabelUnderPoint(e.clientX, e.clientY);
      if (target !== hoveredLabel) {
        if (hoveredLabel) hoveredLabel.button.classList.remove('is-hovered');
        if (target) target.button.classList.add('is-hovered');
        renderer.domElement.style.cursor = target ? 'pointer' : '';
        hoveredLabel = target;
      }
    }
  });

  renderer.domElement.addEventListener('pointerleave', () => {
    if (hoveredLabel) {
      hoveredLabel.button.classList.remove('is-hovered');
      hoveredLabel = null;
      renderer.domElement.style.cursor = '';
    }
  });

  renderer.domElement.addEventListener('pointerdown', e => {
    press = [e.clientX, e.clientY];
    downLabel = (e.button === 0) ? findLabelUnderPoint(e.clientX, e.clientY) : null;
    closeSearchDropdown();
  });

  renderer.domElement.addEventListener('pointerup', e => {
    if (!press) return;
    const moved = Math.hypot(e.clientX - press[0], e.clientY - press[1]);
    const isClick = moved <= 5;
    const isLeft = (e.button === 0);

    // Only register a text click if:
    // 1. Mouse was over the text object at the start of the click
    // 2. Mouse is over the text object at the end of the click
    // 3. Mouse did not move / drag
    // 4. Primary left button
    if (isLeft && isClick && downLabel) {
      const upLabel = findLabelUnderPoint(e.clientX, e.clientY);
      if (upLabel && upLabel === downLabel) {
        press = null;
        downLabel = null;
        setHighlight(upLabel.data);
        openLore(upLabel.data, upLabel.button);
        return;
      }
    }

    downLabel = null;
    if (!isClick || !isLeft) {
      press = null;
      return;
    }
    press = null;

    const bounds=renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects(hitObjects.filter(o=>o.visible&&(o.parent!==eventGroup||eventGroup.visible)));
    const landmarkHit=landmarks.pick(raycaster);
    if(landmarkHit&&(!hits.length||landmarkHit.distance<hits[0].distance)) {
      setHighlight(landmarkHit.data);
      openLore(landmarkHit.data,$('#place-search'));
    } else if(hits.length) {
      setHighlight(hits[0].object.userData.entry);
      openLore(hits[0].object.userData.entry,$('#place-search'));
    }
  });

  const homeDirection=new THREE.Vector3(0,1.3,1).normalize();
  let topDown=false;

  function updateTopDownUI(top) {
    topDown=top;
    controls.enableRotate=!top;
    controls.mouseButtons.LEFT=top?THREE.MOUSE.PAN:THREE.MOUSE.ROTATE;
    controls.touches.ONE=top?THREE.TOUCH.PAN:THREE.TOUCH.ROTATE;
    $('.map-hint').textContent=top?'DRAG TO PAN · SCROLL TO ZOOM · CLICK A MARKER':'DRAG TO ORBIT · SCROLL TO ZOOM · CLICK A MARKER';
    const topBtn=$('#top-view');
    if(topBtn) {
      topBtn.setAttribute('aria-pressed',String(top));
      topBtn.textContent=top?'Perspective view ↗':'Top-down view ↓';
      topBtn.title=top?'Return to 3D perspective view':'Look straight down; click again to toggle perspective view';
    }
  }

  function toggleTopDown() {
    const next=!topDown;
    updateTopDownUI(next);
    controls.enableDamping=false;
    const vfov=THREE.MathUtils.degToRad(camera.fov);
    const horizontal=2*Math.atan(Math.tan(vfov/2)*camera.aspect);
    const defaultDistance=Math.max(DEPTH/2/Math.tan(vfov/2),WIDTH/2/Math.tan(horizontal/2))*1.12;
    const currentDistance=camera.position.distanceTo(controls.target)||defaultDistance;
    const distance=THREE.MathUtils.clamp(currentDistance,2.8,controls.maxDistance);
    if(next) {
      camera.position.set(controls.target.x,controls.target.y+distance,controls.target.z);
    } else {
      camera.position.copy(controls.target).add(homeDirection.clone().multiplyScalar(distance));
    }
    controls.update();
    controls.enableDamping=!matchMedia('(prefers-reduced-motion: reduce)').matches;
    invalidate();
  }

  function reset(top=false) {
    updateTopDownUI(top);
    clearHighlight();
    controls.enableDamping=false;
    controls.update();
    const vfov=THREE.MathUtils.degToRad(camera.fov);
    const horizontal=2*Math.atan(Math.tan(vfov/2)*camera.aspect);
    const distance=Math.max(DEPTH/2/Math.tan(vfov/2),WIDTH/2/Math.tan(horizontal/2))*1.12;
    controls.maxDistance=Math.max(42,distance*1.25);
    camera.position.copy(top?new THREE.Vector3(0,distance,0):homeDirection.clone().multiplyScalar(distance));
    camera.position.add(new THREE.Vector3(CENTER_X,0,CENTER_Z));
    controls.target.set(CENTER_X,0,CENTER_Z);controls.update();
    controls.enableDamping=!matchMedia('(prefers-reduced-motion: reduce)').matches;
    invalidate();
  }

  $('#reset-view').onclick=()=>reset();
  $('#top-view').onclick=()=>toggleTopDown();
  $('#explore-rohan').onclick=()=>{reset(true);focusPlace({x:.1,z:2.4,level:1});closeLore();};
  $('#explore-east').onclick=()=>{reset(true);focusPlace({x:8,z:4.7,viewPixels:65});closeLore();};
  $('#map-details').addEventListener('change',invalidate);

  focusPlace=(place,highlight=true)=>{
    const target=point(place.x,place.z);
    target.y*=relief;
    const desiredPixels=place.viewPixels||(place.level===2?230:place.level===1?155:115);
    const distance=THREE.MathUtils.clamp(mapElement.clientHeight/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*desiredPixels),2.8,30);
    if(topDown) {
      camera.position.set(target.x,target.y+distance,target.z);
    } else {
      const offset=camera.position.clone().sub(controls.target).normalize().multiplyScalar(distance);
      camera.position.copy(target).add(offset);
    }
    controls.target.copy(target);
    controls.update();
    if(highlight) setHighlight(place);
    invalidate();
  };
  window.__focusPlace=focusPlace;
  window.__invalidate=invalidate;

  // Fullscreen Application Toggle
  const fullscreenBtn=$('#fullscreen-toggle');
  function isFullscreen() {
    return !!(document.fullscreenElement||document.webkitFullscreenElement||document.querySelector('.atlas-shell')?.classList.contains('is-fullscreen'));
  }
  function updateFullscreenUI() {
    const fs=isFullscreen();
    if(fullscreenBtn) {
      fullscreenBtn.setAttribute('aria-pressed',String(fs));
      fullscreenBtn.innerHTML=fs?'Exit full screen <span>✕</span>':'Full screen <span>⛶</span>';
      fullscreenBtn.title=fs?'Exit full screen application (Esc / F)':'Toggle full screen application (F)';
    }
    resize();
    invalidate();
  }
  function toggleFullscreen() {
    const shell=document.querySelector('.atlas-shell')||document.documentElement;
    if(document.fullscreenElement||document.webkitFullscreenElement) {
      if(document.exitFullscreen) document.exitFullscreen().catch(()=>{});
      else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else if(shell.requestFullscreen) {
      shell.requestFullscreen().catch(()=>{
        shell.classList.toggle('is-fullscreen');
        updateFullscreenUI();
      });
    } else if(shell.webkitRequestFullscreen) {
      shell.webkitRequestFullscreen();
    } else {
      shell.classList.toggle('is-fullscreen');
      updateFullscreenUI();
    }
  }
  if(fullscreenBtn) fullscreenBtn.onclick=toggleFullscreen;
  document.addEventListener('fullscreenchange',updateFullscreenUI);
  document.addEventListener('webkitfullscreenchange',updateFullscreenUI);
  document.addEventListener('keydown',e=>{
    if(e.key.toLowerCase()==='f'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){
      e.preventDefault();
      toggleFullscreen();
    }
  });

  // In-map search bar setup
  const mapSearchInput=$('#map-search-input');
  const mapSearchClear=$('#map-search-clear');
  const mapSearchDropdown=$('#map-search-dropdown');
  const mapSearchContainer=document.querySelector('.map-search');
  const allSearchItems=[...atlasEntries,...events];

  closeSearchDropdown = () => {
    if(mapSearchDropdown && !mapSearchDropdown.hidden) {
      mapSearchDropdown.hidden=true;
      selectedDropdownIndex=-1;
      if(document.activeElement === mapSearchInput) {
        mapSearchInput.blur();
      }
      return true;
    }
    return false;
  };

  function searchPlaces(rawQuery) {
    const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
    const query=normalize(rawQuery.trim());
    if(!query) return [];
    return allSearchItems.filter(p=>{
      const haystack=normalize(`${p.name} ${p.region||''} ${(p.aliases||[]).join(' ')} ${p.type||''}`);
      return haystack.includes(query);
    });
  }

  let selectedDropdownIndex=-1;

  function renderMapSearchResults(matches) {
    if(!mapSearchDropdown) return;
    mapSearchDropdown.replaceChildren();
    selectedDropdownIndex=-1;
    if(!matches.length) {
      const empty=document.createElement('div');
      empty.className='map-search-empty';
      empty.textContent='No places found.';
      mapSearchDropdown.append(empty);
      mapSearchDropdown.hidden=false;
      return;
    }
    const displayed=matches.slice(0,10);
    displayed.forEach((place,i)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='map-search-item';
      button.role='option';
      button.dataset.index=i;
      const left=document.createElement('span');
      const strong=document.createElement('strong');
      strong.textContent=place.name;
      left.append(strong);
      if(place.region) {
        const small=document.createElement('small');
        small.textContent=place.region;
        left.append(small);
      }
      const tag=document.createElement('span');
      tag.className='map-search-tag';
      tag.textContent=place.type||'Place';
      button.append(left,tag);
      button.onclick=()=>{
        selectSearchPlace(place);
      };
      mapSearchDropdown.append(button);
    });
    mapSearchDropdown.hidden=false;
  }

  function selectSearchPlace(place) {
    if(mapSearchInput) mapSearchInput.value=place.name;
    if(mapSearchClear) mapSearchClear.hidden=false;
    closeSearchDropdown();
    focusPlace(place,true);
    openLore(place,mapSearchInput);
  }

  if(mapSearchInput) {
    mapSearchInput.addEventListener('input',()=>{
      const q=mapSearchInput.value.trim();
      if(mapSearchClear) mapSearchClear.hidden=!q;
      if(!q) {
        closeSearchDropdown();
        return;
      }
      const matches=searchPlaces(q);
      renderMapSearchResults(matches);
    });

    mapSearchInput.addEventListener('focus',()=>{
      const q=mapSearchInput.value.trim();
      if(q) {
        const matches=searchPlaces(q);
        renderMapSearchResults(matches);
      }
    });

    mapSearchInput.addEventListener('keydown',e=>{
      if(e.key==='Escape') {
        e.preventDefault();
        closeSearchDropdown();
        return;
      }
      if(!mapSearchDropdown||mapSearchDropdown.hidden) {
        if(e.key==='ArrowDown'||e.key==='Enter') {
          const q=mapSearchInput.value.trim();
          if(q) {
            const matches=searchPlaces(q);
            renderMapSearchResults(matches);
          }
        }
        return;
      }
      const items=mapSearchDropdown.querySelectorAll('.map-search-item');
      if(e.key==='ArrowDown') {
        e.preventDefault();
        if(!items.length) return;
        selectedDropdownIndex=(selectedDropdownIndex+1)%items.length;
        items.forEach((item,idx)=>item.classList.toggle('is-selected',idx===selectedDropdownIndex));
        items[selectedDropdownIndex]?.scrollIntoView({block:'nearest'});
      } else if(e.key==='ArrowUp') {
        e.preventDefault();
        if(!items.length) return;
        selectedDropdownIndex=(selectedDropdownIndex-1+items.length)%items.length;
        items.forEach((item,idx)=>item.classList.toggle('is-selected',idx===selectedDropdownIndex));
        items[selectedDropdownIndex]?.scrollIntoView({block:'nearest'});
      } else if(e.key==='Enter') {
        e.preventDefault();
        if(selectedDropdownIndex>=0&&items[selectedDropdownIndex]) {
          items[selectedDropdownIndex].click();
        } else {
          const matches=searchPlaces(mapSearchInput.value);
          if(matches.length) selectSearchPlace(matches[0]);
        }
      }
    });

    if(mapSearchClear) {
      mapSearchClear.onclick=()=>{
        mapSearchInput.value='';
        mapSearchClear.hidden=true;
        closeSearchDropdown();
        mapSearchInput.focus();
      };
    }

    if(mapSearchContainer) {
      mapSearchContainer.addEventListener('focusout',e=>{
        if(!mapSearchContainer.contains(e.relatedTarget)) {
          closeSearchDropdown();
        }
      });
    }

    document.addEventListener('pointerdown',e=>{
      if(!e.target.closest('.map-search')) {
        closeSearchDropdown();
      }
    });
  }

  $('#relief').addEventListener('input',e=>{relief=Number(e.target.value);terrainGroup.scale.y=relief;landmarks.setRelief(relief);if(highlightedTarget)highlightGroup.position.y=(Math.max(0,elevation(highlightedTarget.x,highlightedTarget.z))+.04)*relief;$('#relief-value').textContent=`${relief.toFixed(1)}×`;invalidate();});
  $('#export-heightmap').onclick=()=>{
    const size=512,values=sampleHeightmap(size),canvas=document.createElement('canvas');
    canvas.width=canvas.height=size;const context=canvas.getContext('2d'),data=context.createImageData(size,size);
    for(let i=0;i<values.length;i++){const v=Math.round(THREE.MathUtils.clamp((values[i]+.5)/2.5,0,1)*255);data.data.set([v,v,v,255],i*4);}
    context.putImageData(data,0,0);const a=document.createElement('a');a.download='middle-earth-heightmap.png';a.href=canvas.toDataURL();a.click();
  };
  function measureLabels(){ lastViewKey='';for(const label of labels) label.width=label.button.offsetWidth||80; }
  function resize(){const w=mapElement.clientWidth,h=mapElement.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);measureLabels();invalidate();}
  resize();reset();
  new ResizeObserver(()=>{resize();if(topDown)reset(true);}).observe(mapElement);
  document.fonts.ready.then(()=>{measureLabels();invalidate();});
  function suspendAnimation(){clearTimeout(animationTimer);cancelAnimationFrame(frame);frame=0;}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendAnimation();else invalidate();});
  new IntersectionObserver(([entry])=>{mapVisible=entry.isIntersecting;if(mapVisible)invalidate();else suspendAnimation();}).observe(mapElement);
  controls.addEventListener('change',invalidate);
  $('#map-status').hidden=true;
  const projected=new THREE.Vector3();
  const compass=$('.compass');
  function render() {
    frame=0;
    const moving=controls.update();
    camera.updateMatrixWorld();
    const width=mapElement.clientWidth,height=mapElement.clientHeight;
    const pixelsPerUnit=height/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.distanceTo(controls.target));
    const level=$('#map-details').checked?detailLevel(pixelsPerUnit):0;
    $('#detail-status').textContent=level===2?'LOCAL DETAIL · streams & landmarks':level===1?'REGIONAL DETAIL · districts & tributaries':'OVERVIEW · zoom in for regional detail';
    const camDist=camera.position.distanceTo(controls.target);
    const isZoomedIn=camDist<16;
    for(const item of detailMeshes)item.mesh.visible=item.level===0||item.level<=level;
    for(const item of pinMeshes) {
      const close=isZoomedIn||camera.position.distanceTo(item.pos)<14;
      item.mesh.visible=!close&&(item.level===0||item.level<=level);
    }
    for(const m of eventMeshes) {
      const close=isZoomedIn||camera.position.distanceTo(m.position)<14;
      m.visible=!close&&eventGroup.visible;
    }
    if(highlightGroup.visible) {
      const close=isZoomedIn||camera.position.distanceTo(highlightGroup.position)<14;
      pillar.visible=!close;
      const t=performance.now()/1000;
      const pulse=(t*1.4)%1;
      pulseRing.scale.setScalar(1+pulse*3.5);
      pulseRingMat.opacity=Math.max(0,(1-pulse)*.85);
      beaconRingMat.opacity=.6+.35*Math.sin(t*4);
      pillarMat.opacity=.2+.15*Math.sin(t*3);
    }
    const viewKey=camera.matrixWorld.elements.join(',')+`/${width}/${height}/${relief}/${level}/${eventGroup.visible}/${highlightedTarget?.id||''}`;
    if(viewKey!==lastViewKey){
    lastViewKey=viewKey;
    const occupied=[];
    for(const label of labels) {
      const {button,data,isEvent,region}=label;
      const y=label.height*relief;
      projected.set(data.x,y,data.z).project(camera);
      const x=(projected.x*.5+.5)*width,yPixel=(-projected.y*.5+.5)*height;
      let labelY=yPixel;
      let visible=(data.level||0)<=level&&(!region||level===0)&&projected.z>-1&&projected.z<1&&x>12&&x<width-12&&yPixel>12&&yPixel<height-12&&(!isEvent||eventGroup.visible);
      const isHighlightedTarget=highlightedTarget&&data.id===highlightedTarget.id;
      if(isHighlightedTarget){
        visible=true;
        button.classList.add('is-highlighted');
        const w=label.width;
        occupied.push([x-w*.5,yPixel-23,x+w*.5,yPixel]);
      } else if(visible&&!region&&!isEvent){
        const w=label.width;
        // Small alternative placements keep rivers and district names readable near towns.
        const offsets=prominent.has(data.id)?[0,-24,24,-48,48,-72,72]:data.area||data.type==='River'||data.type==='Lake'?[0,-24,24,-48,48]:[0];
        visible=false;
        for(const offset of offsets) {
          const rect=[x-w*.5,yPixel+offset-23,x+w*.5,yPixel+offset];
          if(rect[1]<8||rect[3]>height-8)continue;
          if(!occupied.some(r=>rect[0]<r[2]&&rect[2]>r[0]&&rect[1]<r[3]&&rect[3]>r[1])) {
            visible=true;labelY=yPixel+offset;occupied.push(rect);break;
          }
        }
      }
      button.style.visibility=visible?'visible':'hidden';
      button.style.transform=`translate(-50%, -100%) translate(${x}px, ${labelY}px)`;
    }
    compass.style.transform=`rotate(${controls.getAzimuthalAngle()}rad)`;
    }
    landmarks.update(reducedMotion.matches?0:performance.now()/1000,camera);
    renderer.render(scene,camera);
    if(moving)invalidate();
    else if((landmarks.enhanced||highlightGroup.visible)&&!reducedMotion.matches&&!document.hidden&&mapVisible){
      clearTimeout(animationTimer);animationTimer=setTimeout(invalidate,33);
    }
  }
  invalidate();
  window.addEventListener('pagehide',event=>{suspendAnimation();if(!event.persisted)landmarks.dispose();});
  window.addEventListener('pageshow',invalidate);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;suspendAnimation();$('#map-status').hidden=false;$('#map-status').textContent='The 3D view was interrupted. Reload to restore it; the place index is still available.';});
}
try { start(); } catch(error) {
  console.error(error);
  $('#map-status').hidden=false;
  $('#map-status').textContent='The 3D view could not start. Enable WebGL in your browser and reload. You can still explore the lore using the place index below.';
}
