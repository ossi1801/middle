// World-space footprints: the architecture must remain subordinate to the relief.
// Erebor's gate is on the southern foot, not at the mountain's summit marker.
export const LANDMARK_SITES={
  // Primary overview landmarks (Tier 0)
  'isengard':{x:-1.75,z:1.9,scale:.18,ground:.19,radius:.20,tier:0},
  'barad-dur':{x:6.65,z:3.1,scale:.27,ground:.22,radius:.22,tier:0},
  'mount-doom':{x:5.35,z:3.45,scale:.55,inset:.045,tier:0},
  'minas-tirith':{x:2.65,z:4.35,scale:.22,ground:.38,radius:.38,tier:0},
  'minas-morgul':{x:3.98,z:4.48,scale:.18,ground:.20,radius:.22,tier:0},
  'erebor':{x:4.55,z:-4.04,scale:.27,ground:.24,radius:.20,tier:0},
  'black-gate':{x:4.15,z:2.55,scale:.22,ground:.22,radius:.32,rotation:-2.0,tier:0},
  'osgiliath':{x:2.9,z:4.1,scale:.24,radius:.22,tier:0},

  // Regional castles, fortresses & settlements (Tier 1)
  'carn-dum':{x:-1.6,z:-5.8,scale:.22,radius:.22,tier:1},
  'dol-guldur':{x:2.0,z:-0.46,scale:.22,radius:.20,tier:1},
  'dol-amroth':{x:-1.6,z:6.17,scale:.24,radius:.22,tier:1},
  'durthang':{x:4.35,z:2.9,scale:.20,radius:.20,tier:1},
  'carach-angren':{x:4.85,z:3.1,scale:.22,radius:.22,tier:1},
  'fornost':{x:-5.1,z:-3.8,scale:.22,radius:.22,tier:1},
  'annuminas':{x:-6.4,z:-4.0,scale:.24,radius:.22,tier:1},
  'cair-andros':{x:2.5,z:3.55,scale:.22,radius:.20,tier:1},
  'helms-deep':{x:-1.6,z:2.85,scale:.24,ground:.20,radius:.22,tier:1},
  'rivendell':{x:-1.8,z:-3.3,scale:.24,ground:.18,radius:.22,tier:1},
  'bag-end':{x:-6.5,z:-2.6,scale:.22,ground:.18,radius:.20,tier:1},
  'edoras':{x:-0.3,z:3.0,scale:.22,radius:.22,tier:1},
  'moria':{x:-0.95,z:-0.5,scale:.22,radius:.20,tier:1},
  'weathertop':{x:-3.65,z:-2.75,scale:.22,radius:.20,tier:1},
  'argonath':{x:1.4,z:1.13,scale:.26,radius:.22,tier:1},
  'grey-havens':{x:-8.1,z:-2.3,scale:.24,radius:.22,tier:1},
  'lake-town':{x:4.6,z:-3.2,scale:.22,radius:.20,tier:1},
  'bree':{x:-4.65,z:-2.5,scale:.20,radius:.20,tier:1},
  'lothlorien':{x:0.3,z:-0.15,scale:.24,radius:.22,tier:1},
  'cirith-ungol':{x:4.15,z:4.3,scale:.20,radius:.20,tier:1},

  // Canonical regions, wilds & ancient realms (Tier 1)
  'old-forest':{x:-5.45,z:-2.0,scale:.20,radius:.20,tier:1},
  'trollshaws':{x:-2.65,z:-3.15,scale:.20,radius:.20,tier:1},
  'high-pass':{x:-0.8,z:-3.8,scale:.20,radius:.20,tier:1},
  'beorn':{x:0.25,z:-3.35,scale:.20,radius:.20,tier:1},
  'mirkwood':{x:1.85,z:-3.35,scale:.20,radius:.20,tier:1},
  'woodland-realm':{x:3.6,z:-3.85,scale:.22,radius:.20,tier:1},
  'hollin':{x:-2.0,z:-1.15,scale:.20,radius:.20,tier:1},
  'fangorn':{x:-0.25,z:1.35,scale:.22,radius:.20,tier:1},
  'amon-hen':{x:1.65,z:1.75,scale:.20,radius:.20,tier:1},
  'emyn-muil':{x:2.65,z:1.8,scale:.20,radius:.20,tier:1},
  'dead-marshes':{x:3.25,z:2.2,scale:.22,radius:.20,tier:1},
  'henneth-annun':{x:3.65,z:3.25,scale:.20,radius:.20,tier:1},
  'pelargir':{x:2.2,z:5.2,scale:.22,radius:.22,tier:1},
  'dunharrow':{x:-0.35,z:3.46,scale:.20,radius:.20,tier:1},
  'gundabad':{x:-0.9,z:-5.35,scale:.22,radius:.20,tier:1},
  'dale':{x:4.64,z:-4.35,scale:.22,radius:.20,tier:1},
  'aldburg':{x:0.35,z:3.18,scale:.20,radius:.20,tier:1}
};

// Cultural and factional territorial markers
export const FACTION_SITES=[
  // Orc / Shadow territory markers
  {race:'orc', id:'orc-gorgoroth', name:'Orc War-camp · Gorgoroth', region:'Mordor', x:5.93, z:3.71, scale:.20},
  {race:'orc', id:'orc-udun', name:'Orc Staging Ground · Udûn', region:'Northern Mordor', x:4.45, z:2.8, scale:.20},
  {race:'orc', id:'orc-angmar', name:'Witch-king’s War-post · Angmar', region:'Mountains of Angmar', x:-2.0, z:-5.6, scale:.20},
  {race:'orc', id:'orc-gundabad', name:'Goblin Stronghold · Gundabad', region:'Misty Mountains', x:-0.9, z:-5.35, scale:.20},
  {race:'orc', id:'orc-lithlad', name:'Orc Outpost · Lithlad', region:'Southern Mordor', x:8.8, z:4.8, scale:.20},

  // Men of Gondor territory markers
  {race:'men-gondor', id:'men-pelennor', name:'Gondorian Guard · Pelennor', region:'Gondor', x:2.75, z:4.45, scale:.20},
  {race:'men-gondor', id:'men-lossarnach', name:'Fief of Gondor · Lossarnach', region:'Gondor', x:2.05, z:4.6, scale:.20},
  {race:'men-gondor', id:'men-lamedon', name:'Fief of Gondor · Lamedon', region:'Gondor', x:0.1, z:4.85, scale:.20},
  {race:'men-gondor', id:'men-lebennin', name:'Fief of Gondor · Lebennin', region:'Gondor', x:1.0, z:5.47, scale:.20},

  // Men of Rohan territory markers
  {race:'men-rohan', id:'rohan-westemnet', name:'Rohirrim Outpost · Westemnet', region:'Rohan', x:-0.64, z:2.15, scale:.20},
  {race:'men-rohan', id:'rohan-eastemnet', name:'Rohirrim Outpost · Eastemnet', region:'Rohan', x:1.04, z:2.09, scale:.20},
  {race:'men-rohan', id:'rohan-wold', name:'Border Riders · The Wold', region:'Rohan', x:0.91, z:0.95, scale:.20},
  {race:'men-rohan', id:'rohan-eastfold', name:'Rohirrim Muster · Eastfold', region:'Rohan', x:0.87, z:3.33, scale:.20},

  // Elven territory markers
  {race:'elf', id:'elf-lorien', name:'Galadhrim Border · Lothlórien', region:'Celebrant Valley', x:0.2, z:-0.2, scale:.20},
  {race:'elf', id:'elf-mirkwood', name:'Woodland Realm Eaves · Mirkwood', region:'Northern Mirkwood', x:3.2, z:-4.0, scale:.20},
  {race:'elf', id:'elf-hollin', name:'Elven Ruins · Hollin', region:'Eregion', x:-2.35, z:-0.9, scale:.20},

  // Dwarven territory markers
  {race:'dwarf', id:'dwarf-ironhills', name:'Dwarven Bastion · Iron Hills', region:'Rhovanion', x:8.3, z:-4.7, scale:.20},
  {race:'dwarf', id:'dwarf-dimrill', name:'Durin’s Stone · Dimrill Dale', region:'Azanulbizar', x:-0.65, z:-0.45, scale:.20},
  {race:'dwarf', id:'dwarf-eredmithrin', name:'Dwarven Mansions · Ered Mithrin', region:'Grey Mountains', x:2.8, z:-5.2, scale:.20},

  // Hobbit territory markers
  {race:'hobbit', id:'hobbit-westfarthing', name:'Shire Boundary · Westfarthing', region:'The Shire', x:-6.8, z:-2.45, scale:.20},
  {race:'hobbit', id:'hobbit-eastfarthing', name:'Shire Boundary · Eastfarthing', region:'The Shire', x:-5.8, z:-2.4, scale:.20},
  {race:'hobbit', id:'hobbit-southfarthing', name:'Pipe-weed Lands · Southfarthing', region:'The Shire', x:-6.4, z:-1.89, scale:.20}
];
