// Leonida Ledger boot: loads the trophy data, wires the toolbar and the hash
// routing, and re-renders on every change. The app fetches only its own
// data file and writes progress only to localStorage.
import {
  LEDGER_KEY,
  loadLedgerState,
  saveLedgerState,
  seedDemoProgress,
  toggleEarned,
  setTrophyNote,
  setSpoilerSafe,
  exportLedgerJson,
  parseImportedLedger,
} from './store.js';
import {
  renderChecklist,
  renderGuidePane,
  renderRoadmap,
  renderMissables,
  renderNextUp,
  renderProgressBar,
} from './views.js';

const listCol = document.getElementById('listCol');
const guideCol = document.getElementById('guideCol');
const searchInput = document.getElementById('search');
const gradeFilter = document.getElementById('gradeFilter');
const kindFilter = document.getElementById('kindFilter');
const statusFilter = document.getElementById('statusFilter');
const missableOnly = document.getElementById('missableOnly');
const hideEarned = document.getElementById('hideEarned');
const spoilerToggle = document.getElementById('spoilerToggle');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let state = loadLedgerState();
const params = new URLSearchParams(location.search);
const hasSave = localStorage.getItem(LEDGER_KEY) !== null;
if (params.get('demo') === '1' && !hasSave) state = seedDemoProgress(trophies);
if (params.get('spoiler') === '1') state = setSpoilerSafe(state, true);
saveLedgerState(state);

let selectedId = null;

function currentFilters() {
  return {
    search: searchInput.value,
    grade: gradeFilter.value,
    kind: kindFilter.value,
    status: statusFilter.value,
    missableOnly: missableOnly.checked,
    hideEarned: hideEarned.checked,
  };
}

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash === 'roadmap') return { view: 'roadmap', id: null };
  if (hash === 'missables') return { view: 'missables', id: null };
  if (hash === 'next') return { view: 'next', id: null };
  const trophyMatch = hash.match(/^trophy\/(\d+)$/);
  if (trophyMatch) return { view: 'checklist', id: Number(trophyMatch[1]) };
  return { view: 'checklist', id: null };
}

function findTrophy(id) {
  return trophies.find((t) => t.id === id) ?? null;
}

function render() {
  const route = currentRoute();
  selectedId = route.id;
  document.querySelectorAll('.views a').forEach((a) => {
    a.classList.toggle('active', a.dataset.view === route.view);
  });
  spoilerToggle.setAttribute('aria-pressed', String(state.spoilerSafe));
  spoilerToggle.textContent = `Spoiler-safe: ${state.spoilerSafe ? 'on' : 'off'}`;
  renderProgressBar(trophies, state);
  const handlers = {
    selectedId,
    onToggleEarned: (name) => {
      state = toggleEarned(state, name);
      saveLedgerState(state);
      render();
    },
    onSelectTrophy: (id) => {
      location.hash = `#/trophy/${id}`;
    },
    onNote: (name, text) => {
      state = setTrophyNote(state, name, text);
      saveLedgerState(state);
    },
  };
  if (route.view === 'roadmap') renderRoadmap(listCol, trophies, state);
  else if (route.view === 'missables') renderMissables(listCol, trophies, state);
  else if (route.view === 'next') renderNextUp(listCol, trophies, state, handlers);
  else renderChecklist(listCol, trophies, state, currentFilters(), handlers);
  renderGuidePane(guideCol, findTrophy(selectedId), state, handlers);
}

for (const control of [searchInput, gradeFilter, kindFilter, statusFilter, missableOnly, hideEarned]) {
  control.addEventListener('input', render);
  control.addEventListener('change', render);
}

spoilerToggle.addEventListener('click', () => {
  state = setSpoilerSafe(state, !state.spoilerSafe);
  saveLedgerState(state);
  render();
});

exportBtn.addEventListener('click', () => {
  const blob = new Blob([exportLedgerJson(state)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-ledger-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

importFile.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = parseImportedLedger(await file.text(), trophies);
    state = { ...state, earned: imported.earned, notes: imported.notes };
    saveLedgerState(state);
    render();
  } catch {
    alert('That file is not a Leonida Ledger progress export.');
  }
  event.target.value = '';
});

window.addEventListener('hashchange', render);
render();
