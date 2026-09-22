# Middle-earth in relief

A static Three.js atlas of northwestern Middle-earth, with procedural mountain relief, independently toggleable Frodo/Bilbo outward journeys, 15 historical events, and 156 searchable places, districts, waterways and landmarks with clickable lore and reading references.

## Run

From this folder:

```sh
python3 -m http.server 8000
```

Open **http://localhost:8000** in a modern browser with WebGL enabled. Serve over HTTP rather than opening `index.html` as a file: browsers restrict local ES modules. No npm install, build, backend or API key is needed. To publish, upload this directory to any static host, preserving `vendor/` and relative paths.

Three.js 0.169.0 and OrbitControls are vendored locally. Google Fonts is optional; system serif/monospace fallbacks work offline. Three.js’s MIT license is included at `vendor/THREE-LICENSE.txt`.

## Explore

- Drag to orbit; right-drag to pan; scroll/pinch to zoom. Use two fingers to pan on touch screens.
- Toggle Frodo, Bilbo and events independently. Frodo and events start enabled; Bilbo starts disabled.
- Click a named label, gold event star or 3D marker for lore. The place index supports keyboard selection and region/name search. Escape closes the panel and returns focus.
- Top-down view looks straight down and locks rotation: drag with a mouse or one finger to pan, and scroll/pinch to zoom. Reset view restores the tilted, orbitable overview. The terrain relief slider changes vertical exaggeration without changing geography.
- Open “About this atlas & sources” to download a 512 × 512 grayscale heightmap PNG. North is at the top. Decode normalized grayscale `g` to map height with `h = g * 2.5 - 0.5`. The export contains unexaggerated terrain; it excludes markers, trees and routes.

## Research and accuracy

The staged research/framework/implementation plan is in [PLAN.md](PLAN.md).

- [Geography of Middle-earth, with schematic map](https://en.wikipedia.org/wiki/Geography_of_Middle-earth)
- [Tolkien Gateway map portal](https://tolkiengateway.net/wiki/Portal:Maps)
- [Quest of the Ring](https://tolkiengateway.net/wiki/Quest_of_the_Ring)
- [Quest of Erebor](https://tolkiengateway.net/wiki/Quest_of_Erebor)
- [LOTR Project interactive map](https://lotrproject.com/map/) — further reference; full page fetch was unavailable during research.

Each lore entry includes a Tolkien Gateway link and a primary book/chapter reference. Descriptions are original short summaries of the books, not film-specific retellings. Dates use the Second or Third Age; the Battle of Dagorlad predates the two journeys.

This is an **interpretive atlas, not a canonical elevation survey**. Coordinates are hand-positioned and distances are not to scale. The height field is original procedural geometry informed by the major ranges. Minor camps, return journeys, historical border changes and many geographic features are omitted. Underground travel is represented on the surface; route segments interpolate between selected milestones. Earlier events appear on the late Third Age landscape. No third-party map artwork is redistributed. Tolkien’s world and names belong to their respective rights holders; this is an unofficial fan project.

## Files

- `index.html`, `style.css`: accessible interface and responsive layout.
- `data.js`: locations, route waypoint IDs, events and source metadata.
- `terrain.js`: irregular ridge paths, foothills, coast, rivers, charcoal Mordor palette and deterministic elevation sampler. East is +x; south is +z. Terrain extent is 26 × 20 map units: x = −10…16, z = −7…13. The map centre is (3, 3); sampling and camera framing use these explicit bounds.
- `main.js`: geometry, baked surface texture, lighting, forest instances, lightweight terrain-following ribbons, marker selection, cached projected labels, camera and UI state.
- `vendor/`: pinned Three.js modules and license.
- `tests/data.test.mjs`: route integrity, relative geography and height-field checks.

## Validation

With Node 22 or newer:

```sh
node --experimental-default-type=module tests/data.test.mjs
```

Browser validation used Chromium at 1440 × 1000 and 390 × 844: WebGL startup, journey/event controls, hidden event labels, search, lore selection, Escape/focus return, relief control, camera views, heightmap download and horizontal overflow. Deterministic checks cover all 29 locations, eight events, two routes and 16,384 elevation samples.

## Extending the atlas

Add places and their sources in `data.js`, then reference IDs in the journeys. Update ridge paths in `terrain.js` for terrain refinements. A future licensed, geographically calibrated heightmap can replace `elevation(x, z)`; keep the same coordinate convention so labels and routes sample the same terrain. Route lines should retain dense height sampling to stay above steep ridges.

## Relief and performance update

Terrain uses irregular, domain-warped ridges and foothills inspired by the supplied reference, with a southern mountain boundary around Mordor. Its volcanic basin and peaks use a charcoal/ash palette without the snow colors of northern ranges. This remains a procedural interpretation, not an elevation extraction from the reference image.

Fine surface colors and shading are baked once into a 768 × 538 texture; the terrain mesh uses 200 × 140 segments (56,000 triangles, down from 80,640). Route ribbons replace tube meshes. Label elevations and widths are cached, and pixel ratio is capped at 1.5. Rendering is demand-driven, including OrbitControls damping; decorative continuous marker rotation is removed. Chromium validation confirmed zero idle renders over 1.2 seconds, plus redraws after layer, view and relief changes. These checks are not a hardware-independent FPS benchmark.

## Regional geography and zoom detail

The atlas now contains **91 searchable geographic entries** (29 original places plus 62 regional entries), alongside eight event entries. `geography.js` adds 23 landmarks, 16 districts/areas, 19 rivers or channels, four lakes and three illustrative roads. All geographic entries include lore and a source link. Search accepts river and district names as well as settlements.

Use **Explore Rohan** to jump to an overhead regional view. Zooming reveals three levels, based on projected pixels per map unit so the behavior is consistent on desktop and mobile:

- Overview: major rivers, lakes, journey destinations and realm labels.
- Regional (105 pixels/unit): districts, tributaries, roads and regional landmarks.
- Local (190 pixels/unit): minor streams, crossings, caves and mountain landmarks.

The **Regional detail** checkbox suppresses the additional layers. Zoom in further if a label is hidden to avoid a collision. All entries remain available through search regardless of map visibility.

Rohan includes the Entwash, Snowbourn, Isen, Adorn, Limlight, Mering Stream and Deeping-stream; Westfold, Eastfold, the Folde, both Emnets, the Wold and West-march; and Dunharrow, Harrowdale, Aldburg, Entwade and the Fords of Isen. Eriador and Rhovanion gain additional tributaries, lakes and landmarks. River ribbons are grouped by detail tier to reduce draw calls. Labels retain cached heights/measurements and rendering remains demand-driven.

Research references (book geography sections, excluding adaptation-only settlements):

- [Rohan](https://tolkiengateway.net/wiki/Rohan), [Westfold](https://tolkiengateway.net/wiki/Westfold), [Folde](https://tolkiengateway.net/wiki/Folde), [Westemnet](https://tolkiengateway.net/wiki/Westemnet)
- [Entwash](https://tolkiengateway.net/wiki/Entwash), [Snowbourn](https://tolkiengateway.net/wiki/Snowbourn), [Limlight](https://tolkiengateway.net/wiki/Limlight), [Mering Stream](https://tolkiengateway.net/wiki/Mering_Stream)
- [Dunharrow](https://tolkiengateway.net/wiki/Dunharrow), [Harrowdale](https://tolkiengateway.net/wiki/Harrowdale), [Entwade](https://tolkiengateway.net/wiki/Entwade)
- [Hoarwell](https://tolkiengateway.net/wiki/Hoarwell), [Greyflood](https://tolkiengateway.net/wiki/Greyflood), [Long Lake](https://tolkiengateway.net/wiki/Long_Lake), [Nen Hithoel](https://tolkiengateway.net/wiki/Nen_Hithoel)

Courses, road alignments, lake outlines and area-label positions are schematic and fitted to the existing map. Lakes are draped cartographic shapes rather than hydrologically simulated surfaces. District labels indicate approximate areas, not exact administrative borders. The atlas is more detailed, but is not an exhaustive map of every named feature.

Additional validation covers unique geographic IDs, finite river coordinates, tributary confluences, zoom thresholds and Mordor color regressions. Chromium checks verify local labels are hidden at overview, key Rohan names appear after Explore Rohan, river search opens lore, the detail toggle hides extra labels, fine detail appears on closer zoom, mobile exploration works, and the map still renders no frames while idle.

## Eastern and southern expansion

The current catalog has **115 geographic entries plus eight events**. The terrain extends east and south while preserving the original western coordinates. Camera framing, surface textures, plinth and heightmap export share the explicit bounds in `terrain.js`. The texture is now 960 × 738 and terrain geometry 224 × 172 segments; rendering remains demand-driven.

Added Sea of Núrnen and its basin, Nurn, the Iron Hills (with actual relief), Rhûn, South Gondor/Harondor, Near Harad, Harad/Sutherland, Khand, Belfalas, Lebennin, Pelargir, Umbar and Dol Amroth. Added Harnen, Poros, Carnen, Morgulduin and four explicitly unnamed schematic Núrnen feeders. Southern Mordor retains dark tones, with subdued cultivated-country colors around Nurn.

Isengard now occupies the carved valley of Nan Curunír below Methedras, rather than the end of a mountain ridge. Osgiliath is aligned with an Anduin waypoint and visible at overview level. Minas Morgul is an overview landmark west of Cirith Ungol; Frodo’s outward route now passes its vicinity. Search ignores accents and supports aliases such as Nurnen, Harondor, Haradwaith and Sutherland. Sutherland is treated as another name for the southern lands of Harad, not a separate invented kingdom.

Use **Explore East** for the expanded eastern/southern view. Region boundaries and river courses remain schematic; this does not claim to map all of distant Rhûn or Harad.

Research: the supplied [LOTR Project view](http://lotrproject.com/map/#zoom=3&lat=-1731&lon=1500&layers=BTTTTTTTT) was retried over HTTP and HTTPS, but could not be fetched in this environment. Cross-checks used [Núrnen](https://tolkiengateway.net/wiki/Sea_of_N%C3%BArnen), [Iron Hills](https://tolkiengateway.net/wiki/Iron_Hills), [South Gondor](https://tolkiengateway.net/wiki/South_Gondor), [Near Harad](https://tolkiengateway.net/wiki/Near_Harad), [Khand](https://tolkiengateway.net/wiki/Khand), [Isengard](https://tolkiengateway.net/wiki/Isengard), [Minas Morgul](https://tolkiengateway.net/wiki/Minas_Morgul), and [The South / Sutherland](https://www.glyphweb.com/arda/s/south.php). Book-geography sections are used rather than game-only names.

Regression checks cover expanded bounds, Isengard’s low valley floor relative to the nearby ridge, Iron Hills relief, the Osgiliath/Anduin coordinate match, lake feeder endpoints, requested overview labels, alias searches, mobile navigation, heightmap download and zero idle redraws.

## Procedural landmark models and effects

`landmarks.js` builds nine original Three.js miniatures: Orthanc and its ring wall, Barad-dûr with a cinematic Eye of Sauron, Mount Doom’s glowing crater, the seven tiers of Minas Tirith, Minas Morgul, Erebor’s gate, Rivendell, Helm’s Deep and Bag End. These are small atlas miniatures, not exact architectural reconstructions. Click the models or their labels for the existing lore. Their foundations follow terrain relief without stretching the buildings vertically. Building sizes are 18–27% of the initial symbol sizes; footprint locations and scales are shared in `landmark-sites.js`. Erebor’s gate is placed on the southern foothill rather than the summit. Settlement pads are blended into the height field so buildings, textures and exported terrain agree. Particles scale with their source models; redundant location pins are hidden at modeled landmarks.

**Low-poly mode is the default on every load.** All nine low-detail models total 1,764 triangles, with meshes batched by material within each landmark. Static lava and the Eye remain visible without animated effects. Idle rendering stays suspended.

Check **Enhanced models & effects** to create richer models (16,252 triangles total) and a shared 240-particle system for Mount Doom embers, the Eye and Morgul wisps. Enhanced resources are created only on first use and reused on subsequent toggles. Effects run at a capped cadence of at most roughly 30 updates/second, pause offscreen or in a hidden tab, and honor reduced-motion preferences. Switching the checkbox off restores low-poly geometry and zero idle redraws. Geometry is local code; there are no imported models or postprocessing dependencies.

Additional tests:

```sh
node --experimental-default-type=module tests/landmarks.test.mjs
```

Checks cover the low-poly triangle budget, lazy creation, resource reuse, finite geometry/particle positions, relief anchoring and model raycasting. Chromium validation covers default low mode, opt-in animation, returning to idle, reduced motion, offscreen suspension, mobile layout and reload defaults.

## Expanded canonical geography and timeline events

Referencing LOTRProject map & timeline, Tolkien Gateway, and canonical Tolkien geography, the atlas has expanded to include key historical milestones and landmarks across Middle-earth:

- **25 New Canonical Places**: Annúminas, Fornost, Barrow-downs, Michel Delving, Crickhollow, Carn Dûm, Mount Gundabad, Rhosgobel, Dimrill Dale, Mirrormere, Redhorn Gate, Ost-in-Edhil, Field of Celebrant, Cair Andros, Pelennor Fields, Harlond (Gondor), Paths of the Dead, Stone of Erech, Calembel, Linhir, Tolfalas, Durthang, Carach Angren (Isenmouthe), Lond Daer, and the Withered Heath.
- **12 Regional Areas**: Ered Mithrin (Grey Mountains), Realm of Angmar, North Downs, Westfarthing, Eastfarthing, Lossarnach, Lamedon, Pinnath Gelin, Udûn (Mordor), Lithlad (Plain of Ash), Emyn Arnen, and Ethir Anduin (Delta).
- **4 Waterways**: Sirannon (Gate-stream of Moria), Morthond (Blackroot), Lefnui, and Ringló.
- **7 Timeline Milestone Events**: The Siege of Barad-dûr (SA 3434–3441), Battle of the Morannon (25 March TA 3019), The Battle of Bywater (3 Nov TA 3019), Coronation of King Elessar (1 May TA 3019), The Fall of Amon Sûl (TA 1409), The Breaking of the Fellowship (26 Feb TA 3019), and The Council of Elrond (25 Oct TA 3018).
