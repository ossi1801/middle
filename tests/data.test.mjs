import assert from 'node:assert/strict';
import { locations, journeys, events } from '../data.js';
import { elevation, terrainColor, mordorMask, sampleHeightmap, WIDTH, DEPTH, BOUNDS } from '../terrain.js';
const ids=new Set(locations.map(p=>p.id));
assert.equal(ids.size,locations.length,'Place IDs must be unique');
for(const p of [...locations,...events]) {
  assert.ok(p.x>BOUNDS.minX && p.x<BOUNDS.maxX && p.z>BOUNDS.minZ && p.z<BOUNDS.maxZ,`${p.id} is in bounds`);
  assert.ok(p.description && p.reading && new URL(p.source).protocol==='https:');
}
for(const route of Object.values(journeys)) for(const id of route.points) assert.ok(ids.has(id),`Unknown route stop ${id}`);
assert.equal(journeys.frodo.points[0],'bag-end');
assert.equal(journeys.frodo.points.at(-1),'mount-doom');
assert.ok(!journeys.frodo.points.includes('minas-tirith'),'Minas Tirith is not on Frodo’s outward quest');
assert.ok(journeys.frodo.points.indexOf('black-gate')<journeys.frodo.points.indexOf('cirith-ungol'));
assert.equal(journeys.bilbo.points.at(-1),'erebor');
for(const event of events) assert.ok(ids.has(event.place));
const p=id=>locations.find(p=>p.id===id);
assert.ok(p('lothlorien').x>p('moria').x && p('lothlorien').z>p('rivendell').z);
assert.ok(p('erebor').z<p('lake-town').z);
assert.ok(p('mount-doom').x>p('minas-tirith').x);
assert.ok(elevation(-.8,-4)>.6,'Misty Mountains have relief');
assert.ok(elevation(p('erebor').x,p('erebor').z)>1.5,'Erebor is a distinct peak');
assert.ok(elevation(-9,2)<0,'Western ocean lies below sea level');
const samples=sampleHeightmap(128);
assert.equal(samples.length,128*128);
assert.ok(samples.every(Number.isFinite),'No invalid height samples');
assert.deepEqual(samples,sampleHeightmap(128),'Heightmap is deterministic');
console.log(`PASS: ${locations.length} places, ${events.length} events, 2 routes, geography and 16,384 terrain samples`);

for(const [x,z] of [[5.35,3.45],[6.65,3.1],[6,5]]) {
  assert.ok(mordorMask(x,z)>.95,'Mordor interior has full volcanic palette');
  const rgb=terrainColor(x,z,elevation(x,z));
  assert.ok(Math.max(...rgb)<65,'Mordor stays charcoal even at altitude');
}
assert.equal(mordorMask(2.6,4.35),0,'Gondor is outside the Mordor palette');
assert.ok(elevation(6.6,8.24)>.6,'Southern Mordor has a mountain boundary');
assert.ok(samples.every(h=>h>=-.5&&h<=2),'Heightmap export range contains terrain');
console.log('PASS: Mordor palette, southern range and heightmap bounds');

const { geographyEntries, rivers, localAreas, detailLevel } = await import('../geography.js');
const allIds=new Set([...locations,...geographyEntries].map(p=>p.id));
assert.equal(allIds.size,locations.length+geographyEntries.length,'All searchable IDs are unique');
for(const feature of geographyEntries) {
  assert.ok(feature.description && feature.reading && ['tolkiengateway.net','www.glyphweb.com'].includes(new URL(feature.source).hostname));
  assert.ok(feature.x>BOUNDS.minX && feature.x<BOUNDS.maxX && feature.z>BOUNDS.minZ && feature.z<BOUNDS.maxZ);
}
for(const river of rivers) {
  for(const [x,z] of river.points) assert.ok(Number.isFinite(elevation(x,z)));
  if(river.joins) {
    const parent=rivers.find(r=>r.id===river.joins);
    assert.ok(parent,`Unknown river confluence ${river.joins}`);
    assert.ok(parent.points.some(p=>p[0]===river.points.at(-1)[0]&&p[1]===river.points.at(-1)[1]),`${river.name} meets ${parent.name}`);
  }
}
assert.deepEqual([detailLevel(50),detailLevel(120),detailLevel(210)],[0,1,2]);
assert.ok(localAreas.find(a=>a.id==='westemnet').x<.56);
assert.ok(localAreas.find(a=>a.id==='eastemnet').x>.56);
console.log(`PASS: ${geographyEntries.length} regional features, river confluences and zoom tiers`);

const find=id=>[...locations,...geographyEntries].find(p=>p.id===id);
for(const id of ['nurnen','iron-hills','south-gondor','near-harad','khand','harad','minas-morgul','osgiliath'])assert.ok(find(id),id);
assert.ok(BOUNDS.maxX>12&&BOUNDS.maxZ>11,'Atlas extends east and south');
assert.ok(elevation(find('isengard').x,find('isengard').z)<.35,'Isengard sits on a valley floor');
assert.ok(elevation(-1.4,1.35)>elevation(-1.75,1.9)+.4,'Methedras rises above Isengard');
assert.ok(find('iron-hills').x>find('erebor').x);
assert.ok(elevation(find('iron-hills').x,find('iron-hills').z)>.4,'Iron Hills have modeled relief');
assert.ok(find('nurnen').z>find('mount-doom').z&&find('nurnen').z<8);
assert.ok(find('khand').x>find('nurnen').x&&find('khand').z>find('nurnen').z);
assert.ok(find('south-gondor').z<find('near-harad').z);
assert.equal(find('osgiliath').level,0,'Osgiliath is an overview landmark');
assert.ok(rivers.find(r=>r.id==='anduin').points.some(([x,z])=>x===find('osgiliath').x&&z===find('osgiliath').z));
assert.ok(journeys.frodo.points.includes('minas-morgul'));
console.log('PASS: expanded bounds, missing regions, valley placement and Osgiliath river alignment');

const { lakes }=await import('../geography.js');
for(const river of rivers.filter(r=>r.joinsLake)) {
  const lake=lakes.find(l=>l.id===river.joinsLake),[x,z]=river.points.at(-1);
  assert.ok(lake&&Math.hypot((x-lake.x)/lake.rx,(z-lake.z)/lake.rz)<1,'Nurnen feeders reach the lake');
}
assert.equal(elevation(8,6.12),.12,'Nurnen basin is level at the lake centre');

// Verifications for expanded canonical Middle-earth datapoints
for(const id of ['annuminas','fornost','carn-dum','gundabad','cair-andros','pelennor-fields','paths-dead','durthang','withered-heath']) {
  assert.ok(find(id),`Expected place ${id} to exist`);
}
for(const id of ['ered-mithrin','angmar-region','north-downs','westfarthing','eastfarthing','lossarnach','lamedon','pinnath-gelin','udun-mordor','lithlad']) {
  assert.ok(find(id),`Expected area ${id} to exist`);
}
for(const id of ['sirannon','morthond','lefnui','ringlo']) {
  assert.ok(rivers.find(r=>r.id===id),`Expected river ${id} to exist`);
}
for(const id of ['siege-barad-dur','morannon-stand','bywater-battle','coronation','amon-sul-fall','breaking-fellowship','council-elrond']) {
  assert.ok(events.find(e=>e.id===id),`Expected event ${id} to exist`);
}
assert.ok(find('annuminas').x < find('fornost').x, 'Annúminas is west of Fornost');
assert.ok(find('carn-dum').z < -5, 'Carn Dûm is in the far north of Angmar');
assert.ok(find('withered-heath').x > find('ered-mithrin').x, 'Withered Heath is east of Ered Mithrin center');
assert.ok(Math.hypot(find('pelennor-fields').x - find('minas-tirith').x, find('pelennor-fields').z - find('minas-tirith').z) < .5, 'Pelennor Fields is adjacent to Minas Tirith');
assert.ok(elevation(2.15, 4.28) > 0.8, 'Mount Mindolluin rises west of Minas Tirith');
const lowerAnduin = rivers.find(r => r.id === 'anduin').points.filter(([x, z]) => z >= 3.2);
for (const [x, z] of lowerAnduin) {
  assert.ok(elevation(x, z) < 0.42, `Lower Anduin at (${x}, ${z}) flows through river valley without crossing mountain ridges (elev=${elevation(x, z)})`);
}

// Verifications for satellite-aligned relief and geographic additions
for (const id of ['orocarni', 'forodwaith', 'hills-of-rhun', 'morgai', 'dorwinion', 'andrast', 'rhun-forest', 'wild-wood']) {
  assert.ok(find(id), `Expected area ${id} to exist`);
}
assert.ok(BOUNDS.minZ <= -9, 'Map bounds expanded north to reveal Forodwaith');
assert.ok(elevation(-3.8, -7.2) > 0.6, 'Mountains of Angmar curve northwest with relief');
assert.ok(elevation(5.4, -5.2) > 0.6, 'Ered Mithrin has relief in the north');
assert.ok(elevation(6.2, -5.2) < 0.45, 'Ered Mithrin terminates before Iron Hills, leaving open valley');
assert.ok(elevation(11.5, -5.5) < 0.35, 'Northeast waste is open plains, not a continuous mountain wall');
assert.ok(find('iron-hills').x - find('withered-heath').x > 2.0, 'Iron Hills have wide separation east of Withered Heath');
const longLake = find('long-lake');
assert.ok(longLake.rx <= 0.16 && longLake.rz <= 0.35, 'Long Lake is smaller and scaled realistically');
assert.ok(longLake.z > -3.0 && p('erebor').z > -4.2, 'Long Lake and Erebor are positioned further south');
assert.ok(elevation(-1.3, 1.75) > 0.45, 'Misty Mountains extend south east of Nan Curunír');
assert.ok(elevation(-2.1, 3.0) > 0.5, 'Northern White Mountains rise south of the Gap of Rohan');
assert.ok(elevation(-2.25, 1.7) > 0.4, 'Nan Curunír western arm flanks Isengard');
assert.ok(elevation(14.1, 1.4) > 0.8, 'Orocarni (Red Mountains) has relief in central east');
assert.ok(elevation(14.0, -4.0) < 0.35, 'Orocarni does not extend to the far northeast');
assert.ok(elevation(14.2, 9.0) < 0.35, 'Orocarni does not extend to the southeast border near Khand');
assert.ok(elevation(-4.3, 5.2) > 0.4, 'Pinnath Gelin and Andrast highlands have relief');
assert.ok(elevation(6.5, 0.85) > 0.4, 'Hills of Rhûn have relief');
assert.ok(elevation(5.6, 5.2) > 0.5, 'The Morgai / dividing ridge inside Mordor has relief');

const forodRgb = terrainColor(1, -8.0, elevation(1, -8.0));
assert.ok(forodRgb[0] > 170 && forodRgb[1] > 185 && forodRgb[2] > 185, 'Forodwaith has pale arctic tundra palette');

const orocarniRgb = terrainColor(14.1, 1.4, elevation(14.1, 1.4));
assert.ok(orocarniRgb[0] > orocarniRgb[2] + 40, 'Orocarni rock has reddish montane color');

console.log('PASS: expanded canonical Middle-earth places, areas, waterways, relief, and satellite biomes');

