# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/MisyooRtz/gta6-trophy-guide-v3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/MisyooRtz/gta6-trophy-guide-v3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5: 1 platinum, 2 gold, 6 silver and 46 bronze, 28 of them hidden on PlayStation until earned.

Every trophy carries its official name, description and grade as PlayStation publishes them, plus a guide in this ledger's own words that cites its sources — Exophase and PSNProfiles for the list itself, PowerPyx, GTABase, KeenGamer and U7BUY where their reporting pins down a step. A specific location or step with no source behind it gets no credit here, so every guide names where its facts come from.

## What it does

- **Checklist tracker** — tick trophies off; progress is saved in the browser (localStorage) with a progress bar and per-grade counts. Export your progress to a JSON file and import it back.
- **Filters** — search by name, mission or keyword; filter by grade, kind (story, missable, collectibles, activities, challenges, exploration, combat & heists, money), status, missable-only and hide-earned.
- **Spoiler-safe** — one toggle hides the names and descriptions of hidden story trophies you have not earned yet. It stays on across visits.
- **Guide pane** — tap any trophy to open its full guide beside the list: what to do, where, how, when it can be missed, its steps, its sources, and a personal note field saved per trophy.
- **Roadmap to Platinum** — five stages in order, from the early story to the grind, with per-stage counts.
- **Missables** — exactly one trophy can be missed: **Positive Mental Attitude**. Its first meditation happens in Chapter 1, the morning after the mission Down to Earth, when Lucia mentions meditating in the kitchen at Jason's house. Follow her to the balcony and choose Accept. That spot is gone after Chapter 1, and the game has no mission replay, so keep a manual save.
- **Next Up** — your next five trophies in roadmap order, with the missable one first while it is still unearned.
- **Fully offline** — static files under `app/`; the app fetches only its own `data/trophies.json` and reaches for no network. No Rockstar logo, artwork or game screenshots are used.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Build the hand-in bundle (the same thing `main.ts` does in the grader):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css` — the page and its Vice-sunset paper look.
- `app/app.js` — boot, hash routing (`#/`, `#/roadmap`, `#/missables`, `#/next`, `#/trophy/<id>`) and the toolbar.
- `app/store.js` — progress, notes and the spoiler setting in localStorage, plus export/import.
- `app/views.js` — the checklist, guide pane, roadmap, missables page and Next Up planner.
- `app/data/trophies.json` — the 55 trophies with official names, descriptions and grades, hidden flags, kinds, roadmap stages, guides and sources.
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
- `screenshots/` — four real renders of the app (see `shots.json`).

## A note on the unconfirmed ones

A few trophies' exact triggers are still unverified in play — Bad Luck, I Guess; The Truth Is Out There; Ten Pin; Capital Offense; Challenging Tank — and their guides say so plainly instead of inventing a location. Where a guide rests on the official description alone, it says "from the official description, not yet checked in the game".

---

Built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty ($250 USDC). Try make.fun yourself: https://make.fun/r/j2k22wgn
