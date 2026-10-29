# Chicago Budget Game

An interactive, **data-grounded** civic game: you play Chicago's mayor closing the city's
structural budget gap by choosing among **real reform options** drawn from three official
reports (CFFTF + EY, in `./reports/`). Modeled on the "you are the developer" structure of
Daniel Kay Hertz's affordable-housing game. **v1.1 — mayor mode** is live at the site root;
**v2** (three parts: Follow the dollar, Close the gap, Grow the base) is being built in
phases per `REVAMP.md`. The v2 pages are at `#follow`, `#gap`, `#grow`, `#math`, `#sources`.

Every dollar and percent the game shows traces to `data/sources.enriched.json` — the verified
data of record. Nothing is invented. You pick a difficulty (near-term, durable, or stretch),
work through a fixed sequence of decisions — standalone levers, domain dials, and dissent
forks — and each choice banks a real dollar impact and moves four meters (gap closed, political
capital, equity, long-term health) toward one of several endings. Levers that need Springfield
to act only partly count until the State moves.

## Quickstart

```bash
npm install
npm run dev      # play locally (Vite dev server)
npm test         # run the full suite (Vitest)
npm run build    # typecheck (strict) + static build to dist/
cd data/pipeline && uv run pytest   # public-data pipeline tests
```

## How it's laid out

- **`data/sources.enriched.json`** — the data of record (194 options + structural-gap figures
  + a verification block). The single source of every figure. See `data/VERIFY_REPORT.md`.
- **`data/public/`, `data/modeled.json`, `data/assumptions.json`** — v2's other two number
  sources (public data built by `data/pipeline/`, and our own calculations + assumptions).
  `test/data/provenance.test.ts` fails the build on any figure that traces to none of them.
- **`src/engine/`** — pure, DOM-free, persona-agnostic game logic: it reads the data and emits
  structured outcomes (dollar impact, basis, affected groups, meter deltas). Knows nothing
  about UI. v2 ("Chicagoan mode") will add a second *view* over this same engine.
- **`src/view/`** — the mayor-mode view: DOM rendering (`render.ts`, `main.ts`), all
  player-facing copy (`copy.ts`), and pure view logic (`narrative.ts`).
- **`test/`** — test-first coverage of every lever/dial/fork plus full-playthrough tests,
  including a pinned humane-ceiling golden (`test/fixtures/humane-ceiling.json`).

## More

- **`REVAMP.md`** — the v2 brief and phase plan.
- **`CLAUDE.md`** — project rules (test-first, no invented numbers, engine/view separation).
- **`SPEC.md`** — the v2 design of record; v1 is archived at `docs/SPEC-v1.md`.
- **`worklog.md`** — append-only build log and the source of truth for progress + golden pins.
