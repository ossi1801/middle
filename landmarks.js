import * as THREE from './vendor/three.module.js';
import { LANDMARK_SITES } from './landmark-sites.js';

export const LANDMARK_IDS=['isengard','barad-dur','mount-doom','minas-tirith','minas-morgul','erebor','rivendell','helms-deep','bag-end','black-gate'];
// Small, terrain-grounded miniatures. No model downloads.
export function createLandmarks(entries,elevation) {
  const root=new THREE.Group();root.name='Atlas landmarks';
  const records=[];let enhanced=false,relief=1,effects=null;
  function build(id,rich) {
    const pieces=[],glowing=[],segments=rich?32:8;
    const add=(geometry,color,x=0,y=0,z=0,scale=[1,1,1],rotation=[0,0,0],glow=false)=>{
      const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale));
      const g=geometry.index?geometry.toNonIndexed():geometry.clone();geometry.dispose();g.applyMatrix4(matrix);
      const colors=new Float32Array(g.attributes.position.count*3),c=new THREE.Color(color);
      for(let i=0;i<colors.length;i+=3)colors.set([c.r,c.g,c.b],i);
      g.setAttribute('color',new THREE.BufferAttribute(colors,3));(glow?glowing:pieces).push(g);
    };
    const box=(color,x,y,z,w,h,d,scale=[1,1,1],rotation=[0,0,0],glow=false)=>add(new THREE.BoxGeometry(w,h,d),color,x,y,z,scale,rotation,glow);
    const cylinder=(color,x,y,z,top,bottom,h)=>add(new THREE.CylinderGeometry(top,bottom,h,segments),color,x,y,z);
    const cone=(color,x,y,z,r,h)=>add(new THREE.ConeGeometry(r,h,rich?16:4),color,x,y,z);
    const ring=(color,x,y,z,r,t,glow=false,vertical=false)=>add(new THREE.TorusGeometry(r,t,rich?8:4,segments),color,x,y,z,[1,1,1],[vertical?0:Math.PI/2,0,0],glow);
    const dark='#22272a',stone='#a9ada6',white='#e5e4d7',gold='#d2af61';
    if(id==='isengard') {
      cylinder('#566053',0,.025,0,.33,.35,.05);ring('#70756b',0,.07,0,.31,.028);
      cylinder(dark,0,.39,0,.075,.13,.75);
      for(const x of [-1,1])for(const z of [-1,1]){box(dark,x*.08,.52,z*.08,.065,.9,.065);cone(dark,x*.08,1.04,z*.08,.057,.28);}
      box('#090e12',0,.22,.132,.045,.15,.012);
    } else if(id==='barad-dur'||id==='minas-morgul') {
      const morgul=id==='minas-morgul',body=morgul?'#34423f':dark;
      cylinder(body,0,.08,0,.24,.32,.16);cylinder(body,0,.48,0,.1,.2,.82);
      for(const x of [-1,1]){box(body,x*.2,.31,0,.15,.5,.2);cone(body,x*.2,.64,0,.14,.3);}
      if(morgul){cone(body,0,1.03,0,.15,.5);ring('#9ae6b4',0,.7,0,.13,.016,true);}
      else {for(const x of [-1,1])cone(dark,x*.18,1.17,0,.085,.48);
        add(new THREE.TorusGeometry(.14,.034,rich?10:4,segments),'#ff850f',0,1.33,0,[1.65,.8,1],[0,0,0],true);
        add(new THREE.SphereGeometry(1,rich?16:8,rich?12:6),'#ffc04a',0,1.33,0,[.16,.075,.036],[0,0,0],true);
        add(new THREE.SphereGeometry(1,8,6),'#190704',0,1.33,.042,[.019,.075,.012]);}
    } else if(id==='mount-doom') {
      cylinder('#34312e',0,-.06,0,.18,.36,.32);
      cylinder('#f35a0b',0,.1,0,.15,.15,.025);
      add(new THREE.CircleGeometry(.146,segments),'#ffac20',0,.117,0,[1,1,1],[-Math.PI/2,0,0],true);
      ring('#521e13',0,.115,0,.19,.052);
      for(let i=0;i<3;i++)add(new THREE.BoxGeometry(.025,.015,.27),'#ff6116',Math.sin(i*2.1)*.19,-.03,Math.cos(i*2.1)*.19,[1,1,1],[.55,i*2.1,0],true);
    } else if(id==='minas-tirith') {
      for(let i=0;i<7;i++)cylinder(i%2?white:'#b9c0b8',0,.045+i*.072,0,.34-i*.037,.36-i*.037,.073);
      box(white,0,.72,0,.06,.5,.06);cone('#aeb8b7',0,1,0,.055,.12);
      box('#737e80',0,.22,-.11,.045,.4,.68);
      box('#343c3e',0,.053,.344,.066,.10,.015);
    } else if(id==='erebor') {
      box('#636b68',0,.08,.04,.42,.18,.21);box('#191e22',0,.07,.154,.15,.15,.013);
      for(const x of [-1,1]){box(gold,x*.13,.13,.16,.035,.25,.035);cone('#8b9890',x*.19,.25,.01,.1,.23);}
      box(gold,0,.2,.16,.28,.035,.03);
    } else if(id==='rivendell') {
      for(const x of [-.19,0,.19]){box('#d7c9a6',x,.1,0,.16,.2,.22);cone('#467f7d',x,.27,0,.15,.18);}
      box('#a6bcb0',0,.04,.23,.5,.045,.08);
      for(const x of [-.19,.19])cylinder('#a6bcb0',x,-.025,.23,.017,.017,.16);
    } else if(id==='helms-deep') {
      box(stone,0,.13,0,.6,.26,.07);cylinder('#c0c4b5',-.2,.23,0,.10,.12,.46);
      box('#303835',.13,.065,.039,.085,.13,.01);
      for(let i=0;i<7;i++)box(stone,-.28+i*.09,.28,0,.045,.07,.08);
    } else if(id==='bag-end') {
      add(new THREE.SphereGeometry(1,segments,rich?16:6),'#60824a',0,.025,0,[.3,.18,.22]);
      cylinder('#67884f',0,0,0,.35,.35,.025);
      add(new THREE.CircleGeometry(.072,segments),'#284a29',0,.065,.22);
      ring(gold,0,.065,.226,.076,.009,false,true);
      box('#6a5040',.14,.2,-.03,.05,.21,.05);
      add(new THREE.SphereGeometry(.009,6,4),gold,.03,.065,.232);
    } else if(id==='black-gate') {
      const iron='#16191c',steel='#3a4148',door='#090c0e';
      box(dark,0,.14,0,.52,.26,.09);
      box(door,0,.09,.046,.14,.18,.015);
      box(iron,0,.19,.048,.18,.035,.018);
      for(let i=0;i<5;i++)box(dark,-.16+i*.08,.29,0,.045,.06,.095);
      for(const x of [-.30,.30]) {
        box(dark,x,.18,0,.15,.36,.15);
        cylinder(iron,x,.42,0,.06,.075,.24);
        cylinder(steel,x,.55,0,.07,.06,.05);
        cone(dark,x,.66,0,.06,.22);
        if(rich) {
          for(const dx of [-.05,.05])for(const dz of [-.05,.05])cone(iron,x+dx,.58,dz,.018,.1);
          box('#ff4a11',x,.42,.065,.02,.05,.01,[1,1,1],[0,0,0],true);
        }
      }
      box(dark,-.38,.10,-.03,.12,.18,.12);
      box(dark,.38,.10,-.03,.12,.18,.12);
    }
    if(rich&&id!=='mount-doom'&&id!=='bag-end'&&id!=='black-gate') {
      for(let i=0;i<12;i++){const angle=i/12*Math.PI*2;box(stone,Math.sin(angle)*.27,.07,Math.cos(angle)*.27,.022,.09,.022);}
      if(['isengard','barad-dur','minas-morgul'].includes(id))for(let i=0;i<5;i++)ring('#4c5355',0,.15+i*.13,0,.16-i*.014,.009);
    }
    const group=new THREE.Group();
    for(const [list,lit] of [[pieces,false],[glowing,true]]) {
      if(!list.length)continue;
      const geometry=new THREE.BufferGeometry();
      for(const name of ['position','normal','uv','color']){
        const arrays=list.map(g=>g.attributes[name]);const size=arrays[0].itemSize;
        const combined=new Float32Array(arrays.reduce((sum,a)=>sum+a.array.length,0));let offset=0;
        for(const a of arrays){combined.set(a.array,offset);offset+=a.array.length;}
        geometry.setAttribute(name,new THREE.BufferAttribute(combined,size));
      }
      list.forEach(g=>g.dispose());geometry.computeBoundingSphere();
      group.add(new THREE.Mesh(geometry,lit?new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,flatShading:!rich})));
    }
    return group;
  }
  for(const id of LANDMARK_IDS){
    const data=entries.find(p=>p.id===id);if(!data)continue;
    const site=LANDMARK_SITES[id];
    const anchor=new THREE.Group();anchor.name=id;
    anchor.position.set(site.x,elevation(site.x,site.z)-(site.inset||0),site.z);
    anchor.scale.setScalar(site.scale);
    if(site.rotation)anchor.rotation.y=site.rotation;
    const low=build(id,false);anchor.add(low);root.add(anchor);records.push({data,site,anchor,low,high:null});
  }
  function makeEffects(){
    const group=new THREE.Group(),count=240,positions=new Float32Array(count*3),colors=new Float32Array(count*3),seeds=new Float32Array(count*3);
    const c=new THREE.Color();
    for(let i=0;i<seeds.length;i++){const value=Math.sin((i+1)*127.1)*43758.5453;seeds[i]=value-Math.floor(value);}
    for(let i=0;i<count;i++){c.set(i<150?'#ff8a22':i<200?'#cb6230':'#b9ffd7');colors.set([c.r,c.g,c.b],i*3);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
    const material=new THREE.PointsMaterial({vertexColors:true,size:.016,transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending});
    const points=new THREE.Points(geometry,material);points.frustumCulled=false;points.raycast=()=>{};group.add(points);root.add(group);
    return {group,geometry,material,positions,count,seeds};
  }
  function update(time,camera){
    // Face the Eye towards the viewer; remains static unless the view/effects change.
    const tower=records.find(r=>r.data.id==='barad-dur');
    if(tower)tower.anchor.rotation.y=Math.atan2(camera.position.x-tower.site.x,camera.position.z-tower.site.z);
    if(!effects||!enhanced)return;
    for(let i=0;i<effects.count;i++){
      const id=i<150?'mount-doom':i<200?'barad-dur':'minas-morgul',r=records.find(r=>r.data.id===id);
      const age=(time*(.18+effects.seeds[i*3]*.13)+effects.seeds[i*3+1])%1,angle=effects.seeds[i*3+2]*Math.PI*2+time*.35;
      const radius=(id==='mount-doom'?.04+age*.35:.12+age*.13)*(.4+effects.seeds[i*3]*.6);
      effects.positions.set([r.site.x+Math.cos(angle)*radius*r.site.scale,r.anchor.position.y+((id==='mount-doom'?.15:1.15)+age*(id==='mount-doom'?.7:.5))*r.site.scale,r.site.z+Math.sin(angle)*radius*r.site.scale],i*3);
    }
    effects.geometry.attributes.position.needsUpdate=true;
    effects.material.opacity=.65+Math.sin(time*2)*.1;
  }
  function setEnhanced(value){
    enhanced=value;
    for(const r of records){if(value&&!r.high){r.high=build(r.data.id,true);r.anchor.add(r.high);}r.low.visible=!value;if(r.high)r.high.visible=value;}
    if(value&&!effects)effects=makeEffects();if(effects)effects.group.visible=value;
  }
  function setRelief(value){relief=value;for(const r of records)r.anchor.position.y=(elevation(r.site.x,r.site.z)-(r.site.inset||0))*relief;}
  function pick(raycaster){
    const meshes=records.flatMap(r=>(enhanced?r.high:r.low).children.map(mesh=>({mesh,data:r.data})));
    const hits=raycaster.intersectObjects(meshes.map(item=>item.mesh),false);
    return hits.length?{distance:hits[0].distance,data:meshes.find(item=>item.mesh===hits[0].object).data}:null;
  }
  function dispose(){root.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});root.removeFromParent();}
  return {root,records,setEnhanced,setRelief,update,pick,dispose,get enhanced(){return enhanced;}};
}
