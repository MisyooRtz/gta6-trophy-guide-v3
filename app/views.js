// Leonida Ledger views: the checklist, the guide pane, the roadmap, the
// missables page and the Next Up planner. All rendering is plain DOM built
// from the trophy data; nothing here fetches from the network.
import { countEarnedByGrade } from './store.js';

export const ROADMAP_STAGES = [
  { name: 'Early story', blurb: 'Chapters 1–2: play the story, bank the Chapter 1 meditation, and try the early activities.' },
  { name: 'Mid story', blurb: 'Chapter 3 and the character strands: finish the stranger finals as their markers appear.' },
  { name: 'Late story', blurb: 'Chapter 4 and the final mission: heists, gang operations and the last story beats.' },
  { name: 'Post-story cleanup', blurb: 'After the credits: collectibles, exploration, races and the money trophies.' },
  { name: 'Grind', blurb: 'The long tail: 100% completion, 250 stunts, 42 range golds, 50 challenges and 500 profile actions.' },
];

const STAGE_ORDER = ROADMAP_STAGES.map((s) => s.name);

export function stageRank(trophy) {
  const rank = STAGE_ORDER.indexOf(trophy.roadmap_stage);
  return rank === -1 ? STAGE_ORDER.length : rank;
}

// What the reader sees for a trophy when spoiler-safe is on: hidden trophies
// stay nameless until they are earned. Visible trophies are never masked.
export function applySpoilerMask(trophy, spoilerSafe, earnedSet) {
  const earned = earnedSet.has(trophy.name);
  if (spoilerSafe && trophy.hidden && !earned) {
    return {
      name: 'Hidden story trophy',
      description: 'Earn it to reveal the name and description.',
      guide: null,
      masked: true,
    };
  }
  return { name: trophy.name, description: trophy.description, guide: trophy.guide, masked: false };
}

export function filterTrophies(trophies, filters, earnedSet) {
  const needle = filters.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
    if (filters.status === 'earned' && !earnedSet.has(t.name)) return false;
    if (filters.status === 'unearned' && earnedSet.has(t.name)) return false;
    if (filters.missableOnly && !t.missable) return false;
    if (filters.hideEarned && earnedSet.has(t.name)) return false;
    if (needle) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.chapter ?? ''} ${t.kind}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

function badge(text, cls) {
  const span = document.createElement('span');
  span.className = `badge ${cls}`;
  span.textContent = text;
  return span;
}

function trophyMetaBadges(trophy) {
  const wrap = document.createElement('div');
  wrap.className = 'trophy-meta';
  wrap.append(badge(trophy.grade, trophy.grade));
  wrap.append(badge(trophy.kind, 'kind'));
  if (trophy.hidden) wrap.append(badge('Hidden', 'hidden'));
  if (trophy.missable) wrap.append(badge('Missable', 'missable'));
  if (trophy.count !== null && trophy.count !== undefined) wrap.append(badge(`Target ${trophy.count}`, 'count'));
  return wrap;
}

export function trophyCard(trophy, state, handlers) {
  const earnedSet = new Set(state.earned);
  const shown = applySpoilerMask(trophy, state.spoilerSafe, earnedSet);
  const card = document.createElement('article');
  card.className = 'trophy-card';
  if (earnedSet.has(trophy.name)) card.classList.add('earned');
  if (handlers.selectedId === trophy.id) card.classList.add('selected');

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earnedSet.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${shown.name} as earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => handlers.onToggleEarned(trophy.name));
  const text = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = shown.name;
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = shown.description;
  text.append(name, desc, trophyMetaBadges(trophy));
  head.append(box, text);
  card.append(head);
  card.addEventListener('click', () => handlers.onSelectTrophy(trophy.id));
  return card;
}

export function renderChecklist(container, trophies, state, filters, handlers) {
  const earnedSet = new Set(state.earned);
  const shown = filterTrophies(trophies, filters, earnedSet);
  container.replaceChildren();
  if (shown.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No trophies match these filters. Loosen the search or clear a filter.';
    container.append(empty);
    return;
  }
  for (const t of shown) container.append(trophyCard(t, state, handlers));
}

export function renderProgressBar(trophies, state) {
  const earnedSet = new Set(state.earned);
  const pct = Math.round((earnedSet.size / trophies.length) * 100);
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressText').textContent =
    `${earnedSet.size} of ${trophies.length} earned · ${pct}% to the platinum`;
  const { counts, totals } = countEarnedByGrade(trophies, earnedSet);
  document.getElementById('gradeCounts').textContent =
    `Platinum ${counts.platinum}/${totals.platinum} · Gold ${counts.gold}/${totals.gold} · Silver ${counts.silver}/${totals.silver} · Bronze ${counts.bronze}/${totals.bronze}`;
}

export function renderGuidePane(container, trophy, state, handlers) {
  const earnedSet = new Set(state.earned);
  container.replaceChildren();
  if (!trophy) {
    const hint = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'Pick a trophy';
    const body = document.createElement('p');
    body.textContent = 'Tap any trophy on the left to open its guide here: what to do, where, how, when it can be missed, and the sources each fact comes from.';
    hint.append(title, body);
    container.append(hint);
    return;
  }
  const shown = applySpoilerMask(trophy, state.spoilerSafe, earnedSet);
  const title = document.createElement('h2');
  title.textContent = shown.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = shown.description;
  container.append(title, official, trophyMetaBadges(trophy));
  if (trophy.missable) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    const strong = document.createElement('strong');
    strong.textContent = 'Missable — ';
    warn.append(strong, document.createTextNode(trophy.missable_note ?? 'Do it before the window closes.'));
    container.append(warn);
  }
  if (shown.masked) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Spoiler-safe is on: the guide for this story trophy stays hidden until you earn it.';
    container.append(note);
  } else {
    const guideHead = document.createElement('h3');
    guideHead.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    container.append(guideHead, guide);
    if (trophy.steps && trophy.steps.length > 0) {
      const stepsHead = document.createElement('h3');
      stepsHead.textContent = 'Steps';
      const steps = document.createElement('ol');
      for (const step of trophy.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        steps.append(li);
      }
      container.append(stepsHead, steps);
    }
    const srcHead = document.createElement('h3');
    srcHead.textContent = 'Sources';
    const srcList = document.createElement('ul');
    srcList.className = 'sources';
    for (const source of trophy.sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = source.name;
      li.append(a);
      srcList.append(li);
    }
    container.append(srcHead, srcList);
  }
  const noteLabel = document.createElement('label');
  noteLabel.className = 'note-label';
  noteLabel.textContent = 'Your note';
  const noteInput = document.createElement('textarea');
  noteInput.className = 'note-input';
  noteInput.value = state.notes[trophy.name] ?? '';
  noteInput.placeholder = 'Your own reminder for this trophy…';
  noteInput.addEventListener('input', () => handlers.onNote(trophy.name, noteInput.value));
  noteLabel.append(noteInput);
  container.append(noteLabel);
}

export function renderRoadmap(container, trophies, state) {
  const earnedSet = new Set(state.earned);
  container.replaceChildren();
  const intro = document.createElement('p');
  intro.textContent = 'Five stages, in order. Finish the story first, then clean up the world, then grind the counters. One trophy can be missed — it is flagged in stage one.';
  container.append(intro);
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.roadmap_stage === stage.name);
    const done = members.filter((t) => earnedSet.has(t.name)).length;
    const block = document.createElement('section');
    block.className = 'stage';
    const head = document.createElement('h2');
    head.textContent = `${stage.name} — ${done}/${members.length}`;
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const list = document.createElement('ul');
    for (const t of members) {
      const li = document.createElement('li');
      const shown = applySpoilerMask(t, state.spoilerSafe, earnedSet);
      li.textContent = `${earnedSet.has(t.name) ? '✓ ' : ''}${shown.name}${t.missable ? ' — MISSABLE' : ''} (${t.grade})`;
      list.append(li);
    }
    block.append(head, blurb, list);
    container.append(block);
  }
}

export function renderMissables(container, trophies, state) {
  const earnedSet = new Set(state.earned);
  container.replaceChildren();
  const warn = document.createElement('div');
  warn.className = 'warn';
  const strong = document.createElement('strong');
  strong.textContent = 'Only one trophy can be missed. ';
  warn.append(strong, document.createTextNode('Everything else in the list can be earned after the story. Keep a manual save at the start of every chapter: the game has no mission replay.'));
  container.append(warn);
  const missable = trophies.filter((t) => t.missable);
  for (const t of missable) {
    const shown = applySpoilerMask(t, state.spoilerSafe, earnedSet);
    const block = document.createElement('section');
    block.className = 'stage';
    const head = document.createElement('h2');
    head.textContent = shown.name;
    const body = document.createElement('p');
    body.textContent = t.missable_note ?? '';
    const guide = document.createElement('p');
    guide.textContent = shown.masked ? 'Spoiler-safe is on: the guide stays hidden until you earn it.' : t.guide;
    block.append(head, body, guide);
    container.append(block);
  }
}

export function nextUpTrophies(trophies, state) {
  const earnedSet = new Set(state.earned);
  const remaining = trophies.filter((t) => !earnedSet.has(t.name) && t.id !== 1);
  remaining.sort((a, b) => {
    if (a.missable !== b.missable) return a.missable ? -1 : 1;
    const stage = stageRank(a) - stageRank(b);
    if (stage !== 0) return stage;
    return a.id - b.id;
  });
  return remaining.slice(0, 5);
}

export function renderNextUp(container, trophies, state, handlers) {
  const earnedSet = new Set(state.earned);
  container.replaceChildren();
  const intro = document.createElement('p');
  intro.textContent = 'Your next five trophies, in roadmap order. The missable one always comes first while it is still unearned.';
  container.append(intro);
  const picks = nextUpTrophies(trophies, state);
  if (picks.length === 0) {
    const done = document.createElement('p');
    done.className = 'empty';
    done.textContent = 'Nothing left but the platinum. Congratulations, Leonida Legend.';
    container.append(done);
    return;
  }
  for (const t of picks) {
    const shown = applySpoilerMask(t, state.spoilerSafe, earnedSet);
    const card = document.createElement('article');
    card.className = 'trophy-card next-card';
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = shown.name;
    const why = document.createElement('div');
    why.className = 'trophy-desc';
    why.textContent = t.missable
      ? `Missable — ${t.missable_note ?? ''}`
      : `${t.roadmap_stage} · ${t.grade}${t.count ? ` · target ${t.count}` : ''}`;
    card.append(name, why, trophyMetaBadges(t));
    card.addEventListener('click', () => handlers.onSelectTrophy(t.id));
    container.append(card);
  }
}
