import * as THREE from './vendor/three.module.js';
import { LANDMARK_SITES, FACTION_SITES } from './landmark-sites.js';
import { geographyEntries } from './geography.js';

export const LANDMARK_IDS=[
  'isengard','barad-dur','mount-doom','minas-tirith','minas-morgul','erebor','black-gate','osgiliath',
  'carn-dum','dol-guldur','dol-amroth','durthang','carach-angren','fornost','annuminas','cair-andros',
  'helms-deep','rivendell','bag-end','edoras','moria','weathertop','argonath','grey-havens',
  'lake-town','bree','lothlorien','cirith-ungol',
  'old-forest','trollshaws','high-pass','beorn','mirkwood','woodland-realm','hollin','fangorn',
  'amon-hen','emyn-muil','dead-marshes','henneth-annun','pelargir','dunharrow','gundabad','dale','aldburg'
];

export function createLandmarks(entries, elevation) {
  const root = new THREE.Group();
  root.name = 'Atlas landmarks';
  root.renderOrder = 10;
  const records = [];
  const factionRecords = [];
  let enhanced = false;
  let relief = 1;
  let effects = null;
  let smaug = null;

  const allEntries = entries ? [...entries, ...geographyEntries] : geographyEntries;

  function build(id, rich) {
    const pieces = [];
    const glowing = [];
    const segments = rich ? 24 : 6;

    const add = (geometry, color, x=0, y=0, z=0, scale=[1,1,1], rotation=[0,0,0], glow=false) => {
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(x,y,z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
        new THREE.Vector3(...scale)
      );
      const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
      geometry.dispose();
      g.applyMatrix4(matrix);
      const colors = new Float32Array(g.attributes.position.count * 3);
      const c = new THREE.Color(color);
      for (let i = 0; i < colors.length; i += 3) colors.set([c.r, c.g, c.b], i);
      g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      (glow ? glowing : pieces).push(g);
    };

    const box = (color, x, y, z, w, h, d, scale=[1,1,1], rotation=[0,0,0], glow=false) =>
      add(new THREE.BoxGeometry(w, h, d), color, x, y, z, scale, rotation, glow);
    const cylinder = (color, x, y, z, top, bottom, h, segs=segments) =>
      add(new THREE.CylinderGeometry(top, bottom, h, segs), color, x, y, z);
    const cone = (color, x, y, z, r, h, segs=rich?12:4) =>
      add(new THREE.ConeGeometry(r, h, segs), color, x, y, z);
    const ring = (color, x, y, z, r, t, glow=false, vertical=false) =>
      add(new THREE.TorusGeometry(r, t, rich?8:4, segments), color, x, y, z, [1,1,1], [vertical?0:Math.PI/2, 0, 0], glow);

    const dark = '#1e2326', stone = '#9aa098', white = '#e5e6dc', gold = '#d2af61';

    if (id === 'isengard') {
      cylinder('#566053', 0, .025, 0, .33, .35, .05);
      ring('#70756b', 0, .07, 0, .31, .028);
      cylinder(dark, 0, .39, 0, .075, .13, .75);
      for (const x of [-1, 1]) for (const z of [-1, 1]) {
        box(dark, x*.08, .52, z*.08, .065, .9, .065);
        cone(dark, x*.08, 1.04, z*.08, .057, .28);
      }
      box('#090e12', 0, .22, .132, .045, .15, .012);
    } else if (id === 'barad-dur' || id === 'minas-morgul') {
      const morgul = id === 'minas-morgul', body = morgul ? '#34423f' : dark;
      if (morgul) {
        // Minas Morgul – unchanged compact model
        cylinder(body, 0, .08, 0, .24, .32, .16);
        cylinder(body, 0, .48, 0, .1, .2, .82);
        for (const x of [-1, 1]) {
          box(body, x*.2, .31, 0, .15, .5, .2);
          cone(body, x*.2, .64, 0, .14, .3);
        }
        cone(body, 0, 1.03, 0, .15, .5);
        ring('#9ae6b4', 0, .7, 0, .13, .016, true);
      } else {
        // ──────────────────────────────────────────
        //  BARAD-DÛR  –  The Dark Tower of Sauron
        //  "wall upon wall, battlement upon battlement,
        //   black, immeasurably strong, mountain of iron,
        //   gate of steel, tower of adamant…
        //   cruel pinnacles and iron crown"
        // ──────────────────────────────────────────
        const iron = '#14171a', obsidian = '#0c0e10', steelDark = '#1e2326';
        const grate = '#222629', ember = '#ff6611', fireGold = '#ffaa22';

        // === TIER 0 – Massive fortress base / mountain-throne ===
        // Broad, squat platform anchoring the tower into the plateau
        cylinder(obsidian, 0, .035, 0, .36, .42, .07);
        // Second stepped ring – battlemented curtain wall
        cylinder(iron, 0, .09, 0, .30, .34, .06);
        // Crenellations on outer wall
        if (rich) {
          for (let i = 0; i < (rich ? 16 : 8); i++) {
            const a = i / (rich ? 16 : 8) * Math.PI * 2;
            box(iron, Math.sin(a)*.32, .14, Math.cos(a)*.32, .04, .04, .04);
          }
        }

        // === TIER 1 – Lower keep with massive flanking walls ===
        cylinder(steelDark, 0, .19, 0, .24, .28, .14);
        // Flanking curtain walls / buttresses
        for (const x of [-1, 1]) {
          box(dark, x*.22, .20, 0, .14, .26, .18);
          // Stepped wall tops
          box(iron, x*.22, .35, 0, .16, .04, .20);
        }

        // === TIER 2 – Rising tower body, octagonal shaft ===
        cylinder(dark, 0, .42, 0, .16, .22, .34);
        // Midway ring ledge / battlement course
        ring(iron, 0, .30, 0, .20, .022);

        // === TIER 3 – Narrowing upper tower ===
        cylinder(obsidian, 0, .72, 0, .10, .15, .28);
        // Upper battlement ring
        ring(grate, 0, .60, 0, .14, .018);

        // === Buttresses – angular supports bracing the shaft ===
        for (const x of [-1, 1]) {
          // Inner buttresses connecting to main tower
          box(dark, x*.16, .38, 0, .06, .42, .08, [1,1,1], [0, 0, x*-.15]);
          box(dark, 0, .38, x*.16, .08, .42, .06, [1,1,1], [x*.15, 0, 0]);
          // Diagonal flying buttresses
          if (rich) {
            box(iron, x*.20, .30, x*.12, .04, .30, .04, [1,1,1], [x*.18, Math.PI/4, x*-.12]);
            box(iron, x*.20, .30, -x*.12, .04, .30, .04, [1,1,1], [-x*.18, -Math.PI/4, x*-.12]);
          }
        }

        // === Corner towers / flanking pinnacles on the base ===
        for (const x of [-1, 1]) for (const z of [-1, 1]) {
          cylinder(obsidian, x*.26, .24, z*.20, .04, .06, .36);
          cone(iron, x*.26, .46, z*.20, .05, .14);
        }

        // === TIER 4 – Slender upper spire ===
        cylinder(dark, 0, .98, 0, .065, .09, .26);
        // Upper ring course
        ring(iron, 0, .88, 0, .09, .014);

        // === The Iron Crown – spiked pinnacles at the summit ===
        // Main crown horns – two tall cruel spires flanking the Eye
        for (const x of [-1, 1]) {
          cone(obsidian, x*.09, 1.28, 0, .035, .40);
          // Smaller spikes beside the horns
          cone(iron, x*.07, 1.18, x*.04, .022, .25);
          cone(iron, x*.06, 1.15, -x*.04, .020, .22);
        }
        // Front and back crown spikes
        for (const z of [-1, 1]) {
          cone(iron, 0, 1.20, z*.08, .025, .28);
        }
        // Additional small pinnacles ringing the crown
        if (rich) {
          for (let i = 0; i < 8; i++) {
            const a = i / 8 * Math.PI * 2;
            cone(grate, Math.sin(a)*.065, 1.14, Math.cos(a)*.065, .015, .16);
          }
        }

        // === The dark gate / entrance slit ===
        box('#090b0d', 0, .15, .285, .07, .14, .015);
        // Secondary gate slit higher up
        if (rich) {
          box('#060809', 0, .50, .158, .04, .10, .012);
        }

        // ──────────────────────────────────────
        //  THE EYE OF SAURON
        //  "The Eye was rimmed with fire…
        //   the black slit of its pupil opened
        //   on a pit, a window into nothing"
        // ──────────────────────────────────────
        const eyeY = 1.10;

        // Outer fire-ring / socket – the "rim of fire"
        add(new THREE.TorusGeometry(.105, .028, rich?12:6, rich?32:16), '#ff5500', 0, eyeY, 0, [1.8, .95, 1], [0, 0, 0], true);
        // Inner brighter fire ring
        add(new THREE.TorusGeometry(.08, .016, rich?10:5, rich?28:14), '#ff8811', 0, eyeY, 0, [1.8, .95, 1], [0, 0, 0], true);

        // Fiery eye – the glowing iris / sclera (almond / cat-eye shape)
        // Horizontally elongated, vertically narrow – the lidless eye
        add(new THREE.SphereGeometry(1, rich?24:10, rich?16:8), '#ffbb33', 0, eyeY, 0, [.155, .068, .038], [0, 0, 0], true);
        // Hotter inner glow core
        add(new THREE.SphereGeometry(1, rich?20:8, rich?12:6), '#ffd866', 0, eyeY, 0, [.12, .052, .042], [0, 0, 0], true);

        // The black slit pupil – "a window into nothing"
        // Tall, narrow vertical slit cutting through the eye
        add(new THREE.SphereGeometry(1, rich?12:6, rich?10:5), '#0a0200', 0, eyeY, .044, [.018, .072, .012]);
        // Pupil inner void – even darker, narrower
        if (rich) {
          add(new THREE.SphereGeometry(1, 8, 6), '#000000', 0, eyeY, .047, [.010, .058, .008]);
        }

        // Radiant glow beams emanating from the Eye
        if (rich) {
          // Horizontal fire-rays extending left and right
          for (const x of [-1, 1]) {
            box(ember, x*.18, eyeY, 0, .14, .012, .008, [1,1,1], [0, 0, 0], true);
            box(fireGold, x*.12, eyeY, 0, .08, .006, .005, [1,1,1], [0, 0, 0], true);
          }
          // Vertical subtle rays
          box('#ff4400', 0, eyeY + .06, 0, .008, .10, .006, [1,1,1], [0, 0, 0], true);
          box('#ff4400', 0, eyeY - .06, 0, .008, .10, .006, [1,1,1], [0, 0, 0], true);
          // Diagonal ember wisps
          for (const r of [.4, -.4, .8, -.8]) {
            box('#cc4400', 0, eyeY, 0, .16, .005, .005, [1,1,1], [0, 0, r], true);
          }
        }
      }
    } else if (id === 'mount-doom') {
      // Mountain body
      cylinder('#34312e', 0, -.06, 0, .18, .36, .32);
      // Inner crater basin — gives depth
      cylinder('#1a1210', 0, .07, 0, .12, .14, .06);
      // Crater rim cylinder
      cylinder('#f35a0b', 0, .1, 0, .15, .15, .025);
      // Layered lava pool — outer dim glow
      add(new THREE.CircleGeometry(.148, segments), '#a33808', 0, .112, 0, [1,1,1], [-Math.PI/2, 0, 0], true);
      // Layered lava pool — main bright surface
      add(new THREE.CircleGeometry(.12, segments), '#ffac20', 0, .115, 0, [1,1,1], [-Math.PI/2, 0, 0], true);
      // Layered lava pool — hotspot center
      add(new THREE.CircleGeometry(.05, segments), '#ffe066', 0, .119, 0, [1,1,1], [-Math.PI/2, 0, 0], true);
      // Dark crater rim ring
      ring('#521e13', 0, .115, 0, .19, .052);
      // Lava streaks — 5 flows at varied angles, widths, and lengths
      const flows = [
        { a: 0.0,  w: .028, l: .30 },
        { a: 1.3,  w: .020, l: .24 },
        { a: 2.5,  w: .032, l: .28 },
        { a: 3.8,  w: .018, l: .22 },
        { a: 5.2,  w: .025, l: .26 },
      ];
      for (const f of flows) {
        // Heat halo undercoat (wider, dimmer)
        add(new THREE.BoxGeometry(f.w * 1.6, .012, f.l), '#8b1a04', Math.sin(f.a)*.19, -.035, Math.cos(f.a)*.19, [1,1,1], [.55, f.a, 0], true);
        // Bright lava streak
        add(new THREE.BoxGeometry(f.w, .015, f.l), '#ff6116', Math.sin(f.a)*.19, -.03, Math.cos(f.a)*.19, [1,1,1], [.55, f.a, 0], true);
      }
      if (rich) {
        // Crater rim rubble — irregular rock blocks
        for (let i = 0; i < 6; i++) {
          const a = i * 1.05 + .3;
          box('#2a2420', Math.sin(a)*.165, .11, Math.cos(a)*.165, .022 + (i%2)*.01, .025, .018);
        }
        // Convection cells — bright patches within the lava pool
        for (let i = 0; i < 4; i++) {
          const ca = i * 1.6 + .4, cr = .04 + (i%3) * .02;
          add(new THREE.CircleGeometry(.025 + (i%2)*.012, segments), i < 2 ? '#ffcc44' : '#ff9922',
            Math.sin(ca)*cr, .12 + i*.003, Math.cos(ca)*cr, [1,1,1], [-Math.PI/2, 0, 0], true);
        }
        // Secondary branching lava tongues
        add(new THREE.BoxGeometry(.014, .012, .15), '#ff4411', Math.sin(.6)*.28, -.06, Math.cos(.6)*.28, [1,1,1], [.4, .8, .2], true);
        add(new THREE.BoxGeometry(.012, .010, .12), '#ff5522', Math.sin(3.2)*.26, -.05, Math.cos(3.2)*.26, [1,1,1], [.5, 3.0, -.15], true);
        // Radiated ground heat — faint large glow disc beneath mountain
        add(new THREE.CircleGeometry(.34, segments), '#ff4400', 0, -.18, 0, [1,1,1], [-Math.PI/2, 0, 0], true);
      }
    } else if (id === 'minas-tirith') {
      for (let i = 0; i < 7; i++) cylinder(i%2 ? white : '#b9c0b8', 0, .045 + i*.072, 0, .34 - i*.037, .36 - i*.037, .073);
      box(white, 0, .72, 0, .06, .5, .06);
      cone('#aeb8b7', 0, 1, 0, .055, .12);
      box('#737e80', 0, .22, -.11, .045, .4, .68);
      box('#343c3e', 0, .053, .344, .066, .10, .015);
    } else if (id === 'erebor') {
      box('#636b68', 0, .08, .04, .42, .18, .21);
      box('#191e22', 0, .07, .154, .15, .15, .013);
      for (const x of [-1, 1]) {
        box(gold, x*.13, .13, .16, .035, .25, .035);
        cone('#8b9890', x*.19, .25, .01, .1, .23);
      }
      box(gold, 0, .2, .16, .28, .035, .03);
    } else if (id === 'rivendell') {
      for (const x of [-.19, 0, .19]) {
        box('#d7c9a6', x, .1, 0, .16, .2, .22);
        cone('#467f7d', x, .27, 0, .15, .18);
      }
      box('#a6bcb0', 0, .04, .23, .5, .045, .08);
      for (const x of [-.19, .19]) cylinder('#a6bcb0', x, -.025, .23, .017, .017, .16);
    } else if (id === 'helms-deep') {
      box(stone, 0, .13, 0, .6, .26, .07);
      cylinder('#c0c4b5', -.2, .23, 0, .10, .12, .46);
      box('#303835', .13, .065, .039, .085, .13, .01);
      for (let i = 0; i < 7; i++) box(stone, -.28 + i*.09, .28, 0, .045, .07, .08);
    } else if (id === 'bag-end') {
      add(new THREE.SphereGeometry(1, segments, rich?16:6), '#60824a', 0, .025, 0, [.3, .18, .22]);
      cylinder('#67884f', 0, 0, 0, .35, .35, .025);
      add(new THREE.CircleGeometry(.072, segments), '#284a29', 0, .065, .22);
      ring(gold, 0, .065, .226, .076, .009, false, true);
      box('#6a5040', .14, .2, -.03, .05, .21, .05);
      add(new THREE.SphereGeometry(.009, 6, 4), gold, .03, .065, .232);
    } else if (id === 'black-gate') {
      const iron = '#16191c', steel = '#3a4148', door = '#090c0e';
      box(dark, 0, .14, 0, .52, .26, .09);
      box(door, 0, .09, .046, .14, .18, .015);
      box(iron, 0, .19, .048, .18, .035, .018);
      for (let i = 0; i < 5; i++) box(dark, -.16 + i*.08, .29, 0, .045, .06, .095);
      for (const x of [-.30, .30]) {
        box(dark, x, .18, 0, .15, .36, .15);
        cylinder(iron, x, .42, 0, .06, .075, .24);
        cylinder(steel, x, .55, 0, .07, .06, .05);
        cone(dark, x, .66, 0, .06, .22);
        if (rich) {
          for (const dx of [-.05, .05]) for (const dz of [-.05, .05]) cone(iron, x+dx, .58, dz, .018, .1);
          box('#ff4a11', x, .42, .065, .02, .05, .01, [1,1,1], [0,0,0], true);
        }
      }
      box(dark, -.38, .10, -.03, .12, .18, .12);
      box(dark, .38, .10, -.03, .12, .18, .12);

    // --- CASTLES & STRONGHOLDS ---
    } else if (id === 'carn-dum') {
      // Witch-king's fortress in Angmar: jagged dark keep, spiked towers, sorcery slits
      const obsidian = '#151719', ironRock = '#282d32';
      box(obsidian, 0, .18, 0, .32, .36, .30);
      cylinder(ironRock, 0, .42, 0, .12, .15, .28, 6);
      cone(obsidian, 0, .64, 0, .12, .24, 6);
      for (const x of [-.18, .18]) for (const z of [-.15, .15]) {
        cylinder(obsidian, x, .30, z, .045, .065, .55, 5);
        cone('#0d0f10', x, .62, z, .05, .18, 5);
      }
      box('#0d0f10', 0, .08, .16, .09, .14, .02);
      if (rich) {
        for (let i = 0; i < 4; i++) box(obsidian, -.12 + i*.08, .38, .155, .03, .05, .02);
        box('#ff2a14', 0, .42, .125, .025, .05, .01, [1,1,1], [0,0,0], true);
      }
    } else if (id === 'dol-guldur') {
      // Hill of Sorcery: dark ruined concentric keep with necromantic lantern
      const mossStone = '#2a322e', ruinStone = '#1d2320';
      cylinder(mossStone, 0, .07, 0, .32, .35, .14);
      cylinder(ruinStone, 0, .22, 0, .18, .22, .24);
      cylinder(mossStone, .07, .42, -.05, .07, .09, .38);
      cone('#141815', .07, .65, -.05, .075, .16);
      ring('#38433d', 0, .15, 0, .26, .025);
      if (rich) {
        box('#42ffa8', .07, .42, .03, .02, .04, .015, [1,1,1], [0,0,0], true);
        for (let i = 0; i < 5; i++) {
          const a = i * 1.25;
          box(mossStone, Math.cos(a)*.24, .16, Math.sin(a)*.24, .035, .09, .035);
        }
      }
    } else if (id === 'dol-amroth') {
      // White sea-castle of Prince Imrahil with Swan Tower
      const seaWall = '#dfe5de', whiteKeep = '#f4f6f1', blueSlate = '#3a6282';
      cylinder(seaWall, 0, .05, 0, .35, .38, .10);
      box(whiteKeep, 0, .18, 0, .24, .28, .22);
      cylinder(whiteKeep, -.09, .38, .07, .05, .065, .44);
      cone(blueSlate, -.09, .64, .07, .055, .16);
      box(blueSlate, 0, .34, -.02, .20, .08, .18);
      if (rich) {
        cone(gold, -.09, .74, .07, .015, .05);
        box(whiteKeep, 0, .10, .12, .06, .12, .03);
        for (let i = 0; i < 4; i++) box(whiteKeep, -.09 + i*.06, .33, .115, .025, .04, .02);
      }
    } else if (id === 'durthang') {
      // Ancient castle turned Orc stronghold in Ephel Dúath
      const blackStone = '#222629';
      box(blackStone, 0, .18, 0, .32, .36, .32);
      for (const x of [-.15, .15]) for (const z of [-.15, .15]) {
        box('#16191b', x, .25, z, .09, .50, .09);
        cone(blackStone, x, .54, z, .05, .12);
      }
      box('#0d0f10', 0, .08, .165, .08, .14, .02);
      if (rich) {
        box('#ff5511', 0, .24, .165, .02, .04, .01, [1,1,1], [0,0,0], true);
      }
    } else if (id === 'carach-angren') {
      // The Isenmouthe: narrow gorge iron gate and rampart
      const ironWall = '#1d2124';
      box(ironWall, 0, .14, 0, .54, .28, .10);
      box('#0d0f11', 0, .09, .052, .12, .18, .015);
      for (const x of [-.24, .24]) {
        cylinder(ironWall, x, .30, 0, .06, .08, .36, 5);
        cone('#121517', x, .52, 0, .065, .18, 5);
      }
      if (rich) {
        for (let i = 0; i < 5; i++) box('#121517', -.16 + i*.08, .29, 0, .03, .05, .11);
      }
    } else if (id === 'fornost') {
      // Norbury of the Kings: ancient ruined fortress
      const ruinGrey = '#5d635c';
      box(ruinGrey, 0, .15, 0, .32, .30, .24);
      for (const x of [-.16, .16]) {
        cylinder(ruinGrey, x, .24, .10, .07, .08, .44);
        cone('#424741', x, .50, .10, .07, .14);
      }
      box('#222622', 0, .07, .122, .08, .14, .015);
      if (rich) {
        box(ruinGrey, 0, .22, -.10, .18, .20, .14);
      }
    } else if (id === 'annuminas') {
      // Royal city on Lake Evendim: Tower of Elendil & palace hall
      const arnorStone = '#d6ded6', lakeSlate = '#3f5968';
      box(arnorStone, 0, .13, -.04, .36, .26, .20);
      cylinder(arnorStone, -.11, .38, -.04, .055, .075, .50);
      cone(lakeSlate, -.11, .67, -.04, .06, .16);
      box(lakeSlate, 0, .28, -.04, .32, .08, .16);
      if (rich) {
        cone(gold, -.11, .77, -.04, .018, .05);
        for (let i = 0; i < 4; i++) cylinder('#c4ccc4', -.10 + i*.07, .08, .08, .015, .015, .16);
      }
    } else if (id === 'cair-andros') {
      // Ship-shaped river fortress on Anduin
      const wallStone = '#949c94';
      cylinder(wallStone, 0, .08, 0, .18, .26, .16);
      box(wallStone, 0, .14, -.12, .16, .26, .26, [1,1,1], [.2, 0, 0]);
      box(wallStone, 0, .18, .06, .14, .34, .14);
      cone('#687068', 0, .38, .06, .08, .12);
    } else if (id === 'osgiliath') {
      // The Great Bridge of Osgiliath & Dome of Stars
      const bridgeStone = '#888f88';
      box(bridgeStone, 0, .08, 0, .16, .10, .54);
      // Stone bridge piers reaching down into the riverbed so river flows under arches
      box(bridgeStone, 0, .015, -.10, .16, .03, .06);
      box(bridgeStone, 0, .015, .10, .16, .03, .06);
      for (const z of [-.22, .22]) {
        box('#727972', 0, .18, z, .18, .26, .14);
        cone('#555d55', 0, .34, z, .09, .10);
      }
      cylinder(bridgeStone, -.12, .16, 0, .13, .15, .22);
      add(new THREE.SphereGeometry(.13, rich?14:7, rich?10:5, 0, Math.PI*2, 0, Math.PI*.5), '#415a72', -.12, .27, 0, [1,.8,1]);
    } else if (id === 'edoras') {
      // Golden Hall of Meduseld on green hill
      cylinder('#49603f', 0, .06, 0, .35, .39, .12);
      box('#5a442d', 0, .18, 0, .30, .14, .18);
      box('#c89f46', 0, .27, 0, .32, .10, .20);
      if (rich) {
        cone(gold, 0, .36, 0, .025, .09);
        cylinder('#4a3724', 0, .12, .10, .02, .02, .12);
      }
    } else if (id === 'moria') {
      // West Gate of Moria: cliff rock face, Doors of Durin & twin holly trees
      box('#464e4b', 0, .20, 0, .38, .40, .14);
      add(new THREE.BoxGeometry(.13, .20, .02), '#8bc0b3', 0, .12, .07, [1,1,1], [0,0,0], true);
      for (const x of [-.17, .17]) {
        cylinder('#3a2c20', x, .08, .08, .02, .025, .16);
        cone('#233b2a', x, .22, .08, .075, .20);
      }
    } else if (id === 'weathertop') {
      // Ruined watchtower crown of Amon Sûl
      cylinder('#635c50', 0, .07, 0, .30, .34, .14);
      ring('#4c463b', 0, .18, 0, .16, .03);
      for (let i = 0; i < 6; i++) {
        const a = i * 1.04;
        box('#403a30', Math.sin(a)*.15, .23, Math.cos(a)*.15, .035, .07, .035);
      }
    } else if (id === 'argonath') {
      // The Pillars of the Kings: colossal crowned statues flanking river
      for (const x of [-.18, .18]) {
        box('#727972', x, .08, 0, .12, .16, .12);
        box('#8a928a', x, .26, 0, .09, .24, .08);
        cylinder(gold, x, .40, 0, .04, .04, .06);
        cone(gold, x, .46, 0, .045, .08);
        box('#6a726a', x + (x>0?-.06:.06), .28, .04, .03, .12, .03);
      }
    } else if (id === 'grey-havens') {
      // Mithlond: white quays and swan-prow ship
      cylinder('#dbe2db', -.06, .04, 0, .32, .34, .08);
      cylinder('#eef4ee', -.12, .24, -.06, .04, .05, .36);
      cone(gold, -.12, .45, -.06, .045, .10);
      box('#8ea0a8', .08, .07, .04, .22, .06, .08);
      cone(white, .20, .12, .04, .03, .14);
    } else if (id === 'lake-town') {
      // Esgaroth: wooden stilt houses over water
      cylinder('#3e3022', 0, .04, 0, .32, .34, .08);
      for (const [x, z] of [[-.08,-.06],[.08,-.06],[-.08,.08],[.08,.08]]) {
        box('#624e38', x, .14, z, .12, .12, .11);
        cone('#7e644a', x, .23, z, .08, .08);
      }
    } else if (id === 'bree') {
      // The Prancing Pony inn & village buildings
      box('#4f3f30', 0, .10, 0, .28, .18, .20);
      box('#7b6852', 0, .22, 0, .30, .10, .22);
      cylinder('#733d2a', .08, .29, -.04, .02, .025, .12);
    } else if (id === 'lothlorien') {
      // Caras Galadhon: giant golden Mallorn tree city
      cylinder('#4a3726', 0, .22, 0, .06, .11, .44);
      cone('#d4b84b', 0, .46, 0, .28, .40);
      ring('#6b5030', 0, .24, 0, .14, .02);
      if (rich) {
        box('#d8ffd8', 0, .25, .13, .02, .03, .015, [1,1,1], [0,0,0], true);
      }
    } else if (id === 'cirith-ungol') {
      // Horned Tower of Cirith Ungol
      const towerStone = '#1d2022';
      box(towerStone, 0, .14, 0, .24, .28, .22);
      box(towerStone, 0, .30, 0, .16, .18, .15);
      for (const x of [-.06, .06]) {
        cone(towerStone, x, .44, 0, .03, .14);
      }
      box('#ff4812', 0, .20, .115, .02, .04, .01, [1,1,1], [0,0,0], true);
    } else if (id === 'old-forest') {
      // Old Man Willow & ancient twisted boughs
      cylinder('#38281b', 0, .14, 0, .08, .14, .28, segments);
      cone('#24351d', 0, .36, 0, .26, .26);
      box('#2e4224', -.07, .24, .06, .18, .16, .18);
      box('#2d2116', .08, .12, .05, .05, .20, .05, [1,1,1], [.2, 0, .4]);
      if (rich) {
        box('#16120e', 0, .12, .08, .04, .08, .02);
        box('#2e4224', .09, .22, -.06, .14, .14, .14);
      }
    } else if (id === 'trollshaws') {
      // Three petrified stone trolls around campfire ring
      ring('#5b574d', 0, .03, 0, .24, .02);
      cylinder('#291e17', 0, .04, 0, .06, .07, .04);
      add(new THREE.SphereGeometry(.025, 6, 4), '#e26b1c', 0, .07, 0, [1,1,1], [0,0,0], true);
      for (let i = 0; i < 3; i++) {
        const a = i * (Math.PI * 2 / 3) + .2;
        const tx = Math.cos(a) * .14, tz = Math.sin(a) * .14;
        cylinder('#717169', tx, .12, tz, .04, .055, .20, 5);
        add(new THREE.SphereGeometry(.042, 6, 4), '#5d5d56', tx, .24, tz);
      }
    } else if (id === 'high-pass') {
      // High Pass: mountain crags, stone archway & goblin cave porch
      box('#4d5558', -.14, .20, 0, .16, .40, .26);
      box('#4d5558', .14, .20, 0, .16, .40, .26);
      box('#3b4144', 0, .36, 0, .16, .08, .22);
      box('#0d0f11', 0, .12, -.04, .12, .20, .10);
      cone('#ff4411', 0, .09, -.02, .015, .04, 4, [1,1,1], [0,0,0], true);
    } else if (id === 'beorn') {
      // Beorn's wooden hall, carved bear posts & beehives
      box('#5b432e', 0, .11, 0, .34, .16, .22);
      cone('#755938', 0, .26, 0, .26, .18, 4);
      for (const x of [-.18, .18]) cylinder('#433021', x, .14, .12, .02, .025, .26);
      cone('#c89a38', .14, .07, -.13, .04, .10, 5);
      cone('#c89a38', .06, .06, -.14, .035, .08, 5);
    } else if (id === 'mirkwood') {
      // Dark twisted canopy & giant spider web strands
      cylinder('#181a17', -.06, .16, 0, .05, .08, .32);
      cylinder('#181a17', .08, .14, .05, .04, .07, .28);
      cone('#16231a', 0, .38, 0, .28, .26);
      box('#d2dada', 0, .22, .02, .24, .14, .02, [1,1,1], [.2, .3, 0]);
      add(new THREE.SphereGeometry(.018, 6, 4), '#ff1808', -.03, .20, .07, [1,1,1], [0,0,0], true);
    } else if (id === 'woodland-realm') {
      // Thranduil's Halls: cliff portal with carved beech-leaf columns & bridge
      box('#6c7870', 0, .20, -.06, .38, .38, .18);
      box('#0e1713', 0, .12, .02, .14, .20, .08);
      cylinder('#a0b2a6', -.10, .15, .04, .02, .025, .28);
      cylinder('#a0b2a6', .10, .15, .04, .02, .025, .28);
      box('#8f7855', 0, .04, .14, .08, .03, .18);
      if (rich) {
        add(new THREE.OctahedronGeometry(.025), '#55ffc0', 0, .26, .05, [1,1,1], [0,0,0], true);
      }
    } else if (id === 'hollin') {
      // Eregion ruins: ancient graceful Elven arches & holly bushes
      cylinder('#c6cec6', -.12, .15, 0, .02, .025, .28);
      cylinder('#c6cec6', .12, .15, 0, .02, .025, .28);
      box('#d2dcd2', 0, .28, 0, .28, .04, .06);
      box('#737e73', 0, .03, 0, .32, .04, .20);
      cone('#1b3d22', -.14, .09, .10, .06, .14);
      cone('#1b3d22', .12, .08, -.09, .05, .12);
    } else if (id === 'fangorn') {
      // Treebeard the Ent & ancient sentinel grove
      cylinder('#3e3122', 0, .12, 0, .045, .06, .24);
      box('#4c3b28', 0, .24, 0, .10, .12, .08);
      cone('#354f2c', 0, .36, 0, .16, .18);
      box('#3e3122', -.08, .26, .02, .025, .16, .025, [1,1,1], [0, 0, .6]);
      box('#3e3122', .08, .26, .02, .025, .16, .025, [1,1,1], [0, 0, -.6]);
      for (const [x, z] of [[-.16,-.10],[.16,-.10],[0,.16]]) {
        cylinder('#2d2419', x, .12, z, .03, .04, .22);
        cone('#263d21', x, .28, z, .11, .16);
      }
    } else if (id === 'amon-hen') {
      // Seat of Seeing: stepped throne dais on high hill
      cylinder('#787d76', 0, .05, 0, .26, .28, .08);
      cylinder('#8e948c', 0, .11, 0, .18, .20, .06);
      box('#a6aca4', 0, .18, 0, .08, .12, .08);
      box('#a6aca4', 0, .26, -.03, .08, .10, .02);
      for (const [x, z] of [[-.10,-.10],[.10,-.10],[-.10,.10],[.10,.10]]) {
        cone('#656a63', x, .18, z, .025, .10);
      }
    } else if (id === 'emyn-muil') {
      // Razor-sharp jagged rocks & rocky labyrinth
      for (let i = 0; i < 5; i++) {
        const a = i * 1.25;
        const rx = Math.cos(a) * .12, rz = Math.sin(a) * .12;
        cone('#58534c', rx, .16, rz, .06, .30 + (i%2)*.08, 4);
      }
      box('#47433e', 0, .08, 0, .22, .14, .18);
    } else if (id === 'dead-marshes') {
      // Stagnant waters & eerie flickering corpse-candles
      cylinder('#1a211b', 0, .03, 0, .34, .36, .06);
      cylinder('#3b3528', -.08, .07, .04, .12, .14, .05);
      cylinder('#3b3528', .09, .06, -.06, .10, .12, .04);
      for (const [x, z] of [[-.05,-.08],[.08,.06],[-.12,.08]]) {
        add(new THREE.SphereGeometry(.02, 6, 4), '#b5ff70', x, .13, z, [1,1,1], [0,0,0], true);
      }
    } else if (id === 'henneth-annun') {
      // Window of the Sunset: waterfall cavern sanctuary
      box('#545c58', 0, .20, -.06, .36, .38, .16);
      box('#0d1210', 0, .14, 0, .12, .20, .08);
      box('#8ecaff', 0, .18, .04, .09, .32, .02, [1,1,1], [0,0,0], true);
      cylinder('#6b7670', .12, .10, .08, .04, .05, .18);
    } else if (id === 'pelargir') {
      // Haven of the Ships: curved quays, lighthouse & Gondorian galley
      cylinder('#ccd4cb', -.06, .05, 0, .28, .30, .08);
      cylinder('#dfe8dc', -.16, .26, -.06, .045, .06, .40);
      cone('#ffd633', -.16, .49, -.06, .035, .08, 6, [1,1,1], [0,0,0], true);
      box('#6d533b', .10, .07, .06, .20, .05, .08);
      cone('#f2ede2', .10, .17, .06, .03, .16, 4);
    } else if (id === 'dunharrow') {
      // Firienfeld mountain hold, switchback ramp & Púkel-men
      box('#595f59', 0, .16, 0, .36, .30, .24);
      box('#494f49', 0, .24, -.06, .30, .16, .16);
      box('#333833', 0, .12, -.14, .09, .16, .04);
      for (let i = 0; i < 4; i++) {
        cone('#6b716b', -.12 + i*.08, .34, .06, .02, .06, 4);
      }
    } else if (id === 'gundabad') {
      // Mount Gundabad orc mountain fortress gate
      const ironOre = '#181a1c';
      box(ironOre, 0, .18, 0, .36, .34, .24);
      for (const x of [-.16, .16]) {
        cylinder(ironOre, x, .28, .08, .05, .065, .42, 5);
        cone('#0e0f10', x, .52, .08, .055, .14, 5);
      }
      box('#0a0b0c', 0, .10, .11, .10, .16, .04);
      box('#ff2610', 0, .36, .11, .025, .06, .01, [1,1,1], [0,0,0], true);
    } else if (id === 'dale') {
      // City of Dale: stone townhouses, colorful roofs & bell tower
      box('#8f9890', -.08, .10, 0, .16, .16, .18);
      cone('#a83d31', -.08, .22, 0, .14, .12, 4);
      box('#8f9890', .10, .08, .04, .14, .14, .14);
      cone('#3e655c', .10, .18, .04, .12, .10, 4);
      cylinder('#a2aba3', .02, .24, -.08, .035, .045, .36);
      cone(gold, .02, .45, -.08, .04, .09, 5);
    } else if (id === 'aldburg') {
      // Old fortress of Rohan: circular earthen mound & chieftain hall
      cylinder('#4a3c2c', 0, .05, 0, .32, .34, .08);
      box('#634e35', 0, .15, 0, .26, .14, .16);
      cone('#a68444', 0, .26, 0, .22, .12, 4);
      cylinder('#382b1c', .12, .20, .10, .015, .02, .24);
    }

    if (rich && !['mount-doom','bag-end','black-gate'].includes(id)) {
      for (let i = 0; i < 8; i++) {
        const a = i/8 * Math.PI * 2;
        box(stone, Math.sin(a)*.25, .05, Math.cos(a)*.25, .02, .08, .02);
      }
    }

    const group = new THREE.Group();
    for (const [list, lit] of [[pieces, false], [glowing, true]]) {
      if (!list.length) continue;
      const geometry = new THREE.BufferGeometry();
      for (const name of ['position','normal','uv','color']) {
        const arrays = list.map(g => g.attributes[name]);
        const size = arrays[0].itemSize;
        const combined = new Float32Array(arrays.reduce((sum, a) => sum + a.array.length, 0));
        let offset = 0;
        for (const a of arrays) { combined.set(a.array, offset); offset += a.array.length; }
        geometry.setAttribute(name, new THREE.BufferAttribute(combined, size));
      }
      list.forEach(g => g.dispose());
      geometry.computeBoundingSphere();
      group.add(new THREE.Mesh(
        geometry,
        lit
          ? new THREE.MeshBasicMaterial({vertexColors:true, side:THREE.DoubleSide})
          : new THREE.MeshStandardMaterial({vertexColors:true, roughness:.85, flatShading:!rich})
      ));
    }
    return group;
  }

  // --- FACTION / RACE TERRITORIAL MODELS ---
  function buildFaction(race, rich) {
    const pieces = [];
    const glowing = [];

    const add = (geometry, color, x=0, y=0, z=0, scale=[1,1,1], rotation=[0,0,0], glow=false) => {
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(x,y,z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
        new THREE.Vector3(...scale)
      );
      const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
      geometry.dispose();
      g.applyMatrix4(matrix);
      const colors = new Float32Array(g.attributes.position.count * 3);
      const c = new THREE.Color(color);
      for (let i = 0; i < colors.length; i += 3) colors.set([c.r, c.g, c.b], i);
      g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      (glow ? glowing : pieces).push(g);
    };

    const box = (color, x, y, z, w, h, d, scale=[1,1,1], rotation=[0,0,0], glow=false) =>
      add(new THREE.BoxGeometry(w, h, d), color, x, y, z, scale, rotation, glow);
    const cylinder = (color, x, y, z, top, bottom, h, segs=rich?16:6) =>
      add(new THREE.CylinderGeometry(top, bottom, h, segs), color, x, y, z);
    const cone = (color, x, y, z, r, h, segs=rich?12:4) =>
      add(new THREE.ConeGeometry(r, h, segs), color, x, y, z);

    if (race === 'orc') {
      // Spiked iron war-totem with burning Red Eye
      cylinder('#241b17', 0, .18, 0, .03, .045, .36);
      box('#161617', 0, .28, 0, .24, .025, .025, [1,1,1], [0, 0, .35]);
      box('#161617', 0, .28, 0, .24, .025, .025, [1,1,1], [0, 0, -.35]);
      cone('#161617', 0, .39, 0, .035, .09);
      add(new THREE.SphereGeometry(rich?.04:.03, 8, 6), '#ff1800', 0, .28, .025, [1,1,1], [0,0,0], true);
    } else if (race === 'men-gondor') {
      // White Tree heraldic stone stele with seven-star crest
      box('#d4dcda', 0, .03, 0, .14, .06, .14);
      box('#f0f4f2', 0, .20, 0, .065, .32, .065);
      cone('#d4af37', 0, .39, 0, .04, .08);
      add(new THREE.SphereGeometry(.02, 6, 4), '#ffdf66', 0, .44, 0, [1,1,1], [0,0,0], true);
    } else if (race === 'men-rohan') {
      // Rohirrim horse-head totem with green sun shield
      cylinder('#543f2a', 0, .18, 0, .03, .04, .36);
      cylinder('#234d2e', 0, .22, .03, .07, .07, .015, rich?14:6);
      add(new THREE.SphereGeometry(.02, 6, 4), '#d4a228', 0, .22, .045);
      cone('#543f2a', 0, .40, 0, .03, .09);
    } else if (race === 'elf') {
      // Twisting silver starlight spire with radiant lantern
      cylinder('#eaf2f5', 0, .22, 0, .03, .045, .44);
      cone('#2ea896', 0, .36, 0, .09, .14);
      add(new THREE.OctahedronGeometry(.035), '#7affea', 0, .46, 0, [1,1,1], [0,0,0], true);
    } else if (race === 'dwarf') {
      // Hexagonal basalt monolith with anvil top
      cylinder('#343a3d', 0, .18, 0, .065, .075, .36, 6);
      box('#d4af37', 0, .26, 0, .11, .02, .11);
      box('#646c72', 0, .38, 0, .11, .035, .06);
    } else if (race === 'hobbit') {
      // Shire boundary post with round green door plaque
      cylinder('#5a5246', 0, .14, 0, .04, .05, .28);
      cylinder('#2b6c35', 0, .15, .042, .06, .06, .014, rich?14:6);
      add(new THREE.SphereGeometry(.01, 6, 4), '#ffd700', 0, .15, .052);
      cylinder('#844234', .02, .31, -.01, .018, .02, .09);
    }

    const group = new THREE.Group();
    for (const [list, lit] of [[pieces, false], [glowing, true]]) {
      if (!list.length) continue;
      const geometry = new THREE.BufferGeometry();
      for (const name of ['position','normal','uv','color']) {
        const arrays = list.map(g => g.attributes[name]);
        const size = arrays[0].itemSize;
        const combined = new Float32Array(arrays.reduce((sum, a) => sum + a.array.length, 0));
        let offset = 0;
        for (const a of arrays) { combined.set(a.array, offset); offset += a.array.length; }
        geometry.setAttribute(name, new THREE.BufferAttribute(combined, size));
      }
      list.forEach(g => g.dispose());
      geometry.computeBoundingSphere();
      const mesh = new THREE.Mesh(
        geometry,
        lit
          ? new THREE.MeshBasicMaterial({vertexColors:true, side:THREE.DoubleSide})
          : new THREE.MeshStandardMaterial({vertexColors:true, roughness:.85, flatShading:!rich})
      );
      mesh.renderOrder = 10;
      group.add(mesh);
    }
    return group;
  }

  // Build landmark records
  for (const id of LANDMARK_IDS) {
    const data = allEntries.find(p => p.id === id);
    if (!data) continue;
    const site = LANDMARK_SITES[id];
    if (!site) continue;
    const anchor = new THREE.Group();
    anchor.name = id;
    anchor.position.set(site.x, elevation(site.x, site.z) - (site.inset || 0), site.z);
    anchor.scale.setScalar(site.scale);
    if (site.rotation) anchor.rotation.y = site.rotation;
    const low = build(id, false);
    anchor.add(low);
    root.add(anchor);
    records.push({ data, site, anchor, low, high: null, tier: site.tier ?? 1 });
  }

  // Build race / faction territorial markers
  const raceGroup = new THREE.Group();
  raceGroup.name = 'Race markers';
  root.add(raceGroup);

  for (const site of FACTION_SITES) {
    const anchor = new THREE.Group();
    anchor.name = site.id;
    anchor.position.set(site.x, elevation(site.x, site.z), site.z);
    anchor.scale.setScalar(site.scale);
    const low = buildFaction(site.race, false);
    anchor.add(low);
    raceGroup.add(anchor);
    factionRecords.push({
      site,
      anchor,
      low,
      high: null,
      data: { id: site.id, name: site.name, region: site.region, type: 'Territory Marker' }
    });
  }

  function makeSmaug() {
    // ──────────────────────────────────────────
    //  SMAUG — low-poly dragon circling Erebor
    //  ~120 triangles, single draw call
    // ──────────────────────────────────────────
    const pieces = [];
    const addPart = (geometry, color, x=0, y=0, z=0, scale=[1,1,1], rotation=[0,0,0]) => {
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
        new THREE.Vector3(...scale)
      );
      const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
      geometry.dispose();
      g.applyMatrix4(matrix);
      const colors = new Float32Array(g.attributes.position.count * 3);
      const c = new THREE.Color(color);
      for (let i = 0; i < colors.length; i += 3) colors.set([c.r, c.g, c.b], i);
      g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      pieces.push(g);
    };

    const scorch = '#8b2a0a', belly = '#c9842a', scale_ = '#a33020', dark = '#3a1510', bone = '#d4a84a';

    // Body — elongated box
    addPart(new THREE.BoxGeometry(.28, .08, .10), scorch, 0, 0, 0);
    // Belly underside
    addPart(new THREE.BoxGeometry(.22, .03, .08), belly, 0, -.04, 0);
    // Neck — tapered forward
    addPart(new THREE.BoxGeometry(.12, .06, .07), scale_, .19, .02, 0, [1,1,1], [0, 0, .2]);
    // Head
    addPart(new THREE.BoxGeometry(.08, .05, .06), dark, .28, .04, 0);
    // Snout
    addPart(new THREE.ConeGeometry(.025, .08, 4), dark, .34, .04, 0, [1,1,1], [0, 0, -Math.PI/2]);
    // Horns
    addPart(new THREE.ConeGeometry(.008, .04, 3), bone, .26, .09, .02, [1,1,1], [-.3, 0, 0]);
    addPart(new THREE.ConeGeometry(.008, .04, 3), bone, .26, .09, -.02, [1,1,1], [.3, 0, 0]);
    // Tail — long tapered section
    addPart(new THREE.BoxGeometry(.20, .04, .05), scale_, -.22, -.01, 0, [1,1,1], [0, 0, -.1]);
    // Tail tip — cone
    addPart(new THREE.ConeGeometry(.02, .10, 4), dark, -.35, -.03, 0, [1,1,1], [0, 0, Math.PI/2]);
    // Left wing — flat angled plane
    addPart(new THREE.BoxGeometry(.22, .008, .28), scorch, -.02, .03, .18, [1,1,1], [.15, 0, 0]);
    // Left wing tip
    addPart(new THREE.BoxGeometry(.10, .005, .14), dark, -.06, .04, .34, [1,1,1], [.3, 0, .1]);
    // Right wing
    addPart(new THREE.BoxGeometry(.22, .008, .28), scorch, -.02, .03, -.18, [1,1,1], [-.15, 0, 0]);
    // Right wing tip
    addPart(new THREE.BoxGeometry(.10, .005, .14), dark, -.06, .04, -.34, [1,1,1], [-.3, 0, .1]);
    // Wing membrane spars (bone struts)
    for (const zSign of [1, -1]) {
      addPart(new THREE.BoxGeometry(.18, .006, .006), bone, .02, .035, zSign * .22, [1,1,1], [0, 0, zSign * .08]);
      addPart(new THREE.BoxGeometry(.12, .005, .005), bone, -.04, .04, zSign * .32, [1,1,1], [0, 0, zSign * .1]);
    }
    // Hind legs — small cylinders
    addPart(new THREE.CylinderGeometry(.012, .015, .06, 4), dark, -.08, -.06, .04);
    addPart(new THREE.CylinderGeometry(.012, .015, .06, 4), dark, -.08, -.06, -.04);

    // Merge into single mesh
    const geometry = new THREE.BufferGeometry();
    for (const name of ['position', 'normal', 'uv', 'color']) {
      const arrays = pieces.map(g => g.attributes[name]);
      const size = arrays[0].itemSize;
      const combined = new Float32Array(arrays.reduce((sum, a) => sum + a.array.length, 0));
      let offset = 0;
      for (const a of arrays) { combined.set(a.array, offset); offset += a.array.length; }
      geometry.setAttribute(name, new THREE.BufferAttribute(combined, size));
    }
    pieces.forEach(g => g.dispose());
    geometry.computeBoundingSphere();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: .75, flatShading: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'Smaug';
    mesh.frustumCulled = false;
    mesh.raycast = () => {};

    const group = new THREE.Group();
    group.name = 'Smaug flight';
    group.add(mesh);
    group.visible = false;
    root.add(group);

    // Erebor orbit parameters
    const ereborRec = records.find(r => r.data.id === 'erebor');
    const cx = ereborRec ? ereborRec.site.x : 4.55;
    const cz = ereborRec ? ereborRec.site.z : -4.04;
    const orbitRadius = 1.8;
    const altitude = 1.4;
    const dragonScale = .6;

    return { group, mesh, cx, cz, orbitRadius, altitude, dragonScale };
  }

  function makeEffects() {
    const group = new THREE.Group();
    const count = 240;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < seeds.length; i++) {
      const value = Math.sin((i + 1) * 127.1) * 43758.5453;
      seeds[i] = value - Math.floor(value);
    }
    for (let i = 0; i < count; i++) {
      // Mount-doom embers: 3 color bands (hot → cooling)
      if (i < 50) c.set('#ffd066');        // bright yellow-white sparks
      else if (i < 100) c.set('#ff8a22');   // orange embers (original)
      else if (i < 150) c.set('#cc3311');   // deep red cooling embers
      else if (i < 200) c.set('#cb6230');   // Barad-dûr
      else c.set('#b9ffd7');                // Minas Morgul
      colors.set([c.r, c.g, c.b], i * 3);
      // Per-particle size variation
      sizes[i] = i < 150
        ? (.012 + seeds[i * 3] * .012)      // mount-doom: varied 0.012–0.024
        : (.014 + seeds[i * 3] * .006);     // others: narrower range
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));
    const material = new THREE.PointsMaterial({
      vertexColors: true,
      size: .016,
      sizeAttenuation: true,
      transparent: true,
      opacity: .72,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.raycast = () => {};
    group.add(points);
    root.add(group);
    return { group, geometry, material, positions, sizes, count, seeds };
  }

  function update(time, camera) {
    // Face the Eye of Barad-dûr towards the viewer
    const tower = records.find(r => r.data.id === 'barad-dur');
    if (tower && camera) {
      tower.anchor.rotation.y = Math.atan2(camera.position.x - tower.site.x, camera.position.z - tower.site.z);
    }

    // Zoom-based LOD and progressive visibility
    if (camera) {
      const camPos = camera.position;
      const camDist = Math.hypot(camPos.x - 3, camPos.y - 3, camPos.z - 3);

      for (const r of records) {
        const d = camPos.distanceTo(r.anchor.position);
        // Visibility: overview sites always visible; regional sites visible when camera is in range
        if (r.tier === 0) {
          r.anchor.visible = true;
        } else {
          r.anchor.visible = d < 22 || camDist < 20;
        }

        // Swapping to higher-res model when close or when cinematic enhanced mode is enabled
        const shouldBeHigh = enhanced || (r.anchor.visible && d < 9.5);
        if (shouldBeHigh) {
          if (!r.high) {
            r.high = build(r.data.id, true);
            r.anchor.add(r.high);
          }
          r.low.visible = false;
          r.high.visible = true;
        } else {
          r.low.visible = true;
          if (r.high) r.high.visible = false;
        }
      }

      // Race markers: visible in regional exploration view
      const raceVisible = camDist < 19;
      raceGroup.visible = raceVisible;
    }

    // Dynamic particle effects
    if (!effects || !enhanced) return;
    const doomRec = records.find(rec => rec.data.id === 'mount-doom');
    for (let i = 0; i < effects.count; i++) {
      const id = i < 150 ? 'mount-doom' : i < 200 ? 'barad-dur' : 'minas-morgul';
      const r = id === 'mount-doom' ? doomRec : records.find(rec => rec.data.id === id);
      if (!r) continue;
      const seed0 = effects.seeds[i*3], seed1 = effects.seeds[i*3+1], seed2 = effects.seeds[i*3+2];
      if (id === 'mount-doom') {
        // Band-specific speed: hot (0–49) fast+narrow, orange (50–99) medium, red (100–149) slow+wide
        const speedMul = i < 50 ? .28 : i < 100 ? .20 : .14;
        const driftMul = i < 50 ? .25 : i < 100 ? .35 : .50;
        const age = (time * (speedMul + seed0 * .10) + seed1) % 1;
        // Wobble: sinusoidal perturbation on angle
        const angle = seed2 * Math.PI * 2 + time * .35 + Math.sin(time * 2 + seed1 * 6.28) * .04;
        const radius = (.04 + age * driftMul) * (.4 + seed0 * .6);
        effects.positions.set([
          r.site.x + Math.cos(angle) * radius * r.site.scale,
          r.anchor.position.y + (.15 + age * (.5 + seed0 * .4)) * r.site.scale,
          r.site.z + Math.sin(angle) * radius * r.site.scale
        ], i * 3);
        // Size fades with age — particles shrink as they rise and cool
        effects.sizes[i] = (.012 + seed0 * .012) * (1 - age * .6);
      } else {
        const age = (time * (.18 + seed0 * .13) + seed1) % 1;
        const angle = seed2 * Math.PI * 2 + time * .35;
        const radius = (.12 + age * .13) * (.4 + seed0 * .6);
        effects.positions.set([
          r.site.x + Math.cos(angle) * radius * r.site.scale,
          r.anchor.position.y + (1.15 + age * .5) * r.site.scale,
          r.site.z + Math.sin(angle) * radius * r.site.scale
        ], i * 3);
      }
    }
    effects.geometry.attributes.position.needsUpdate = true;
    effects.geometry.attributes.size.needsUpdate = true;
    effects.material.opacity = .65 + Math.sin(time * 2) * .1;

    // Lava pool pulsing — modulate mount-doom glowing mesh opacity
    if (doomRec) {
      const active = doomRec.high || doomRec.low;
      const glowMesh = active.children[1]; // second child is the glow-batched mesh (MeshBasicMaterial)
      if (glowMesh && glowMesh.material && glowMesh.material.isMeshBasicMaterial) {
        glowMesh.material.transparent = true;
        glowMesh.material.opacity = .82 + Math.sin(time * .8) * .15;
      }
    }

    // Smaug — circle Erebor
    if (smaug) {
      const orbitSpeed = .12;
      const angle = time * orbitSpeed;
      const x = smaug.cx + Math.cos(angle) * smaug.orbitRadius;
      const z = smaug.cz + Math.sin(angle) * smaug.orbitRadius;
      const bob = Math.sin(time * .6) * .15;
      const y = smaug.altitude + bob;
      smaug.group.position.set(x, y, z);
      smaug.group.scale.setScalar(smaug.dragonScale);
      // Face direction of travel (tangent to orbit) + banking roll
      const facing = angle + Math.PI / 2;
      smaug.group.rotation.set(
        Math.sin(time * 1.2) * .06,   // subtle wing-flap pitch
        -facing,                       // yaw: face along flight path
        Math.sin(time * orbitSpeed) * .15  // bank into the turn
      );
    }
  }

  function setEnhanced(value) {
    enhanced = value;
    for (const r of records) {
      if (value && !r.high) {
        r.high = build(r.data.id, true);
        r.anchor.add(r.high);
      }
      r.low.visible = !value;
      if (r.high) r.high.visible = value;
    }
    if (value && !effects) effects = makeEffects();
    if (effects) effects.group.visible = value;
    if (value && !smaug) smaug = makeSmaug();
    if (smaug) smaug.group.visible = value;
  }

  function setRelief(value) {
    relief = value;
    for (const r of records) {
      r.anchor.position.y = (elevation(r.site.x, r.site.z) - (r.site.inset || 0)) * relief;
    }
    for (const f of factionRecords) {
      f.anchor.position.y = elevation(f.site.x, f.site.z) * relief;
    }
  }

  function pick(raycaster) {
    const landmarkMeshes = records
      .filter(r => r.anchor.visible)
      .flatMap(r => {
        const active = (enhanced || (r.high && r.high.visible)) ? r.high : r.low;
        return active.children.map(mesh => ({ mesh, data: r.data }));
      });
    const factionMeshes = raceGroup.visible
      ? factionRecords.flatMap(f => f.low.children.map(mesh => ({ mesh, data: f.data })))
      : [];
    const allMeshes = [...landmarkMeshes, ...factionMeshes];
    const hits = raycaster.intersectObjects(allMeshes.map(item => item.mesh), false);
    return hits.length ? { distance: hits[0].distance, data: allMeshes.find(item => item.mesh === hits[0].object).data } : null;
  }

  function dispose() {
    root.traverse(object => {
      object.geometry?.dispose();
      object.material?.dispose();
    });
    root.removeFromParent();
  }

  return {
    root,
    records,
    factionRecords,
    setEnhanced,
    setRelief,
    update,
    pick,
    dispose,
    get enhanced() { return enhanced; }
  };
}
