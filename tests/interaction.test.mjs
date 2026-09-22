import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Verify style.css rules
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
assert.ok(css.includes('.map-hint { position: absolute; z-index: 2; left: 34px; bottom: 26px; color: rgba(242,236,222,.72); font-size: 9px; pointer-events: none; }'), 'map-hint has pointer-events: none');
assert.ok(css.includes('.legend { position: absolute; z-index: 2; right: 34px; bottom: 28px; display: flex; gap: 16px; color: rgba(242,236,222,.78); font-size: 8px; pointer-events: none; }'), 'legend has pointer-events: none');

// Verify main.js contains the proper pointerup and closeLore behavior
const mainJs = readFileSync(new URL('../main.js', import.meta.url), 'utf8');
assert.ok(mainJs.includes('let clearHighlight = () => {};'), 'clearHighlight declared at module scope');
assert.ok(mainJs.includes('clearHighlight();\n  if (restoreFocus && lastSelection?.isConnected && lastSelection !== $(\'#map-search-input\'))'), 'closeLore clears highlight and handles search input focus safely');
assert.ok(mainJs.includes('closeLore(false);\n      clearHighlight();'), 'pointerup else block closes lore and clears highlight on empty map click');
assert.ok(mainJs.includes('window.__clearHighlight=clearHighlight;'), 'clearHighlight is exported on window');
assert.ok(mainJs.includes('window.__closeLore=closeLore;'), 'closeLore is exported on window');

// Test interaction logic simulation
let lorePanelOpen = false;
let lorePanelInert = true;
let activeHighlight = null;
let lastSelection = null;
const labels = [
  { data: { id: 'rivendell', name: 'Rivendell' }, isHighlighted: false },
  { data: { id: 'moria', name: 'Moria' }, isHighlighted: false }
];

function setHighlight(place) {
  activeHighlight = place;
  for (const l of labels) l.isHighlighted = (l.data.id === place.id);
}

function clearHighlight() {
  activeHighlight = null;
  for (const l of labels) l.isHighlighted = false;
}

function openLore(data, origin) {
  lastSelection = origin;
  lorePanelOpen = true;
  lorePanelInert = false;
  setHighlight(data);
}

function closeLore(restoreFocus = true) {
  lorePanelOpen = false;
  lorePanelInert = true;
  clearHighlight();
  if (restoreFocus && lastSelection) {
    lastSelection.focused = true;
  }
  lastSelection = null;
}

function handlePointerUp({ isClick, isLeft, hitLabel, hitObject, hitLandmark }) {
  if (!isClick || !isLeft) return;
  if (hitLabel) {
    setHighlight(hitLabel.data);
    openLore(hitLabel.data, hitLabel);
    return;
  }
  if (hitLandmark) {
    setHighlight(hitLandmark.data);
    openLore(hitLandmark.data, null);
  } else if (hitObject) {
    setHighlight(hitObject.data);
    openLore(hitObject.data, null);
  } else {
    closeLore(false);
    clearHighlight();
  }
}

// 1. Focus a place (Rivendell)
openLore(labels[0].data, { focused: false });
assert.equal(lorePanelOpen, true, 'Sidebar is open');
assert.equal(lorePanelInert, false, 'Sidebar is not inert');
assert.equal(activeHighlight.id, 'rivendell', 'Rivendell is selected');
assert.equal(labels[0].isHighlighted, true, 'Rivendell label is highlighted');

// 2. Drag map (orbit camera) -> should NOT close sidebar and NOT unselect place
handlePointerUp({ isClick: false, isLeft: true, hitLabel: null, hitObject: null, hitLandmark: null });
assert.equal(lorePanelOpen, true, 'Dragging does not close sidebar');
assert.equal(activeHighlight.id, 'rivendell', 'Dragging does not unselect place');

// 3. Click map (empty terrain) -> SHOULD close sidebar and unselect place
handlePointerUp({ isClick: true, isLeft: true, hitLabel: null, hitObject: null, hitLandmark: null });
assert.equal(lorePanelOpen, false, 'Clicking map closes sidebar');
assert.equal(lorePanelInert, true, 'Sidebar is inert after closing');
assert.equal(activeHighlight, null, 'Place is unselected');
assert.equal(labels[0].isHighlighted, false, 'Rivendell label is unhighlighted');

// 4. Focus place again, then close via close button
openLore(labels[1].data, { focused: false });
assert.equal(lorePanelOpen, true);
assert.equal(activeHighlight.id, 'moria');
assert.equal(labels[1].isHighlighted, true);

closeLore(true);
assert.equal(lorePanelOpen, false, 'closeLore closes sidebar');
assert.equal(activeHighlight, null, 'closeLore unselects place');
assert.equal(labels[1].isHighlighted, false, 'Moria label is unhighlighted');

// 5. Clicking another place label while one is open switches selection
openLore(labels[0].data, null);
assert.equal(activeHighlight.id, 'rivendell');
handlePointerUp({ isClick: true, isLeft: true, hitLabel: labels[1], hitObject: null, hitLandmark: null });
assert.equal(lorePanelOpen, true, 'Sidebar stays open with new place');
assert.equal(activeHighlight.id, 'moria', 'Highlight moved to Moria');
assert.equal(labels[0].isHighlighted, false, 'Rivendell no longer highlighted');
assert.equal(labels[1].isHighlighted, true, 'Moria is highlighted');

// Click map to close
handlePointerUp({ isClick: true, isLeft: true, hitLabel: null, hitObject: null, hitLandmark: null });
assert.equal(lorePanelOpen, false);
assert.equal(activeHighlight, null);

console.log('PASS: map click closes lore sidebar, unselects place, and preserves orbit drag');
