# Middle-earth relief atlas — research and implementation plan

## 1. Gather geography and lore (completed)
- Scope: northwestern Middle-earth near the end of the Third Age. Earlier events are annotated on this landscape, not reconstructed historical borders.
- References: [Wikipedia geography and schematic map](https://en.wikipedia.org/wiki/Geography_of_Middle-earth), [Tolkien Gateway maps](https://tolkiengateway.net/wiki/Portal:Maps), and [LOTR Project interactive map](https://lotrproject.com/map/). The latter was discoverable but its full page could not be fetched during research.
- Cross-check outward quest sequences with [Quest of the Ring](https://tolkiengateway.net/wiki/Quest_of_the_Ring) and [Quest of Erebor](https://tolkiengateway.net/wiki/Quest_of_Erebor), read on 22 September 2026. Primary reading: The Hobbit; The Fellowship of the Ring; The Two Towers; The Return of the King, including Appendix B.
- Use an original, hand-positioned coordinate dataset: x increases east, z increases south. Preserve relative positions of major settlements, ranges and rivers. These are illustrative coordinates, not surveyed positions.
- Frodo: Shire → Old Forest → Bree → Weathertop → Rivendell → Hollin → Moria → Lórien → Amon Hen → Emyn Muil → Dead Marshes → Black Gate → Henneth Annûn → Cirith Ungol → Mount Doom. Minas Tirith is not on the outward quest.
- Bilbo: Bag End → Trollshaws → Rivendell → High Pass/Goblin-town → Beorn → Mirkwood → Woodland Realm → Lake-town → Erebor. Return journeys and minor camps are outside this first version.
- Give every location/event an original short description, a reading reference and an external source link. Distinguish event dates and avoid presenting different rulers as contemporaries.
- No canonical elevation dataset is available in the researched references. Generate an explicitly interpretive heightmap from ridge paths, coast and seeded surface detail. Do not trace or redistribute copyrighted map artwork.

## 2. Choose framework (completed)
- Static ES modules, HTML and CSS; no backend or build required.
- Three.js 0.169.0, pinned and served locally; OrbitControls for orbit/pan/zoom.
- PlaneGeometry displaced from a deterministic sampled heightmap; vertex colors for land, mountains and Mordor. Routes resample elevation along every segment to avoid disappearing inside terrain.
- DOM labels and a searchable place index provide keyboard/touch selection; raycasting supports 3D markers. Shared data powers all entry points.
- Reference docs: https://threejs.org/docs/pages/PlaneGeometry.html, https://threejs.org/docs/pages/OrbitControls.html, https://threejs.org/docs/pages/Raycaster.html.

## 3. Execute (completed)
- Build relief terrain with recognizable mountain chains, sea, rivers, forest stands and geographic labels.
- Add independent Frodo/Bilbo/event toggles, clickable lore, place search, north-up view, camera reset and elevation control.
- Fit the map on initial load and responsive resizing. Support keyboard selection, reduced motion and visible focus. Show a helpful failure message if WebGL fails.
- Export the actual sampled height field as a grayscale PNG for inspection/reuse.

## 4. Validate
- Verify route references, event references, relative geography and finite elevation samples with automated checks.
- Exercise startup, toggles, selection, search, camera controls and mobile layout in a browser when tooling is available.
- Document launch instructions, sources and approximation boundaries in README.md.

## Regional detail expansion (implemented)
- Research Rohan’s book-based districts, tributaries, valleys and crossings from Tolkien Gateway geography sections and referenced Tolkien maps; exclude game-only settlement names.
- Add a separate `geography.js` catalog with source metadata, connected river paths, area anchors, lakes, roads and level-of-detail thresholds.
- Expand searchable lore to 91 geographic entries; retain the two journeys and eight event entries.
- Reveal detail by screen scale, with regional/local thresholds, a detail toggle and an Explore Rohan shortcut.
- Smooth and drape river paths, group their geometry by detail tier, cache labels and retain idle rendering suspension.
- Validate confluence endpoints, zoom-dependent visibility, major Rohan label readability, mobile behavior and zero idle redraws.

## Eastern/southern correction pass (implemented)
- Retried the user’s LOTR Project URL; unavailable via web and direct fetch. Cross-checked named regions and their relative positions with Tolkien Gateway and the Encyclopedia of Arda.
- Extend explicit bounds east/south to x −10…16, z −7…13; apply them to sampling, geometry, textures, export and camera framing.
- Add Núrnen, southern/eastern lands, Iron Hills relief, connecting rivers and southern coastal landmarks. Preserve unnamed Núrnen rivers as unnamed, and treat Sutherland as Harad’s alternate name.
- Correct Nan Curunír/Isengard relief; expose Osgiliath at overview scale on the Anduin; add Minas Morgul and the nearby quest waypoint.
- Validate actual label visibility and navigation in Chromium, alongside relative-geography and terrain tests.
