// Leonida Ledger progress store: earned ticks, per-trophy notes and the spoiler
// setting, kept in localStorage under one key and exportable as a file.
export const LEDGER_KEY = 'gta6-trophy-guide-v1';

// The thirteen trophies a fresh playthrough earns early, used only to show
// progress in the demo view (?demo=1) when no save exists yet.
export const DEMO_EARNED_IDS = [2, 3, 8, 9, 10, 16, 20, 21, 33, 37, 44, 46, 51];

export function loadLedgerState() {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) return { earned: [], notes: {}, spoilerSafe: false };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => typeof n === 'string') : [],
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      spoilerSafe: parsed.spoilerSafe === true,
    };
  } catch {
    return { earned: [], notes: {}, spoilerSafe: false };
  }
}

export function saveLedgerState(state) {
  localStorage.setItem(LEDGER_KEY, JSON.stringify({
    earned: [...new Set(state.earned)],
    notes: state.notes,
    spoilerSafe: state.spoilerSafe,
  }));
}

export function seedDemoProgress(trophies) {
  const names = trophies.filter((t) => DEMO_EARNED_IDS.includes(t.id)).map((t) => t.name);
  return { earned: names, notes: {}, spoilerSafe: false };
}

export function toggleEarned(state, trophyName) {
  const earned = new Set(state.earned);
  if (earned.has(trophyName)) earned.delete(trophyName);
  else earned.add(trophyName);
  return { ...state, earned: [...earned] };
}

export function setTrophyNote(state, trophyName, text) {
  const notes = { ...state.notes };
  if (text.trim() === '') delete notes[trophyName];
  else notes[trophyName] = text;
  return { ...state, notes };
}

export function setSpoilerSafe(state, on) {
  return { ...state, spoilerSafe: on };
}

// Serialise the save for Export progress (a JSON download).
export function exportLedgerJson(state) {
  return JSON.stringify({ app: 'leonida-ledger', version: 1, earned: state.earned, notes: state.notes }, null, 2);
}

// Parse an Import progress file. Unknown names are dropped, so a file from
// another guide cannot corrupt the checklist; a file with no known trophy
// names at all is refused.
export function parseImportedLedger(text, trophies) {
  const parsed = JSON.parse(text);
  const known = new Set(trophies.map((t) => t.name));
  const candidates = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(candidates)) throw new Error('no earned list in file');
  const earned = candidates.filter((n) => typeof n === 'string' && known.has(n));
  if (earned.length === 0) throw new Error('no known trophy names in file');
  const notes = {};
  if (parsed && typeof parsed === 'object' && parsed.notes && typeof parsed.notes === 'object') {
    for (const [name, note] of Object.entries(parsed.notes)) {
      if (known.has(name) && typeof note === 'string') notes[name] = note;
    }
  }
  return { earned, notes, spoilerSafe: false };
}

export function countEarnedByGrade(trophies, earnedSet) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    totals[t.grade] += 1;
    if (earnedSet.has(t.name)) counts[t.grade] += 1;
  }
  return { counts, totals };
}
