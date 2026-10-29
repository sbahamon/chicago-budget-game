// Mayor-mode view entry point. Drives the engine and renders each screen. All game
// logic is in the engine; this file wires DOM events to engine calls. The player can
// move back/forward and jump between decisions, so state is a per-decision choice
// array that we replay through the (pure) engine to derive the live GameState.

import "./style.css";
import { parseRoute } from "./router";
import { renderPage } from "./pages";
import { copyFor } from "./i18n";
import {
  createGame,
  applyChoice,
  availableDecisions,
  evaluateEnding,
  targetAmount,
  type GameState,
  type Target,
} from "../engine/index";
import {
  renderMeters,
  renderDecision,
  renderDecisionMap,
  renderLedger,
  formatUSD,
} from "./render";
import { shortfall, actFor, biteLine, splashFacts } from "./narrative";
import {
  TITLE,
  SUBTITLE,
  MASTHEAD_EYEBROW,
  TARGET_COPY,
  ENDING_COPY,
  ENDING_DRAMA,
  SHORTFALL_LINE,
  INTRO,
  SPLASH,
  METER_LABELS,
  METER_HELP,
  UI,
} from "./copy";

const root = document.getElementById("app")!;
const DECISIONS = availableDecisions();

let target: Target | null = null;
let choices: (string | null)[] = [];
let current = 0;
// V2: the consequence "bite" for the choice just made; shown once, cleared on nav.
let flash: string | null = null;

function clear(): void {
  root.replaceChildren();
}

/** Civic masthead. On the play screen, `actNumber` lights the four Chicago stars. */
function header(actNumber?: number): HTMLElement {
  const h = document.createElement("header");
  h.className = "masthead";

  const top = document.createElement("div");
  top.className = "masthead__top";
  const eyebrow = document.createElement("span");
  eyebrow.className = "masthead__eyebrow";
  eyebrow.textContent = MASTHEAD_EYEBROW;
  top.appendChild(eyebrow);
  if (actNumber !== undefined) {
    const stars = document.createElement("div");
    stars.className = "masthead__stars";
    stars.title = `Act ${actNumber} of 4`;
    for (let i = 1; i <= 4; i++) {
      const st = document.createElement("span");
      st.className = i <= actNumber ? "masthead__star masthead__star--on" : "masthead__star";
      st.textContent = "✶";
      stars.appendChild(st);
    }
    top.appendChild(stars);
  }
  h.appendChild(top);

  const t = document.createElement("h1");
  t.className = "masthead__title";
  const star = document.createElement("span");
  star.className = "star";
  star.textContent = "✶";
  t.append(star, document.createTextNode(TITLE));
  h.appendChild(t);

  const s = document.createElement("p");
  s.className = "masthead__tag";
  s.textContent = SUBTITLE;
  h.appendChild(s);

  const rule = document.createElement("div");
  rule.className = "masthead__rule";
  h.appendChild(rule);
  return h;
}

/** Replay the chosen decisions through the pure engine to get live state. */
function rebuild(): GameState {
  let state = createGame(target!);
  DECISIONS.forEach((d, i) => {
    const c = choices[i];
    if (c) state = applyChoice(state, d.id, c).state;
  });
  return state;
}

function button(label: string, className: string, onClick: () => void, disabled = false): HTMLButtonElement {
  const b = document.createElement("button");
  b.className = className;
  b.textContent = label;
  b.disabled = disabled;
  if (!disabled) b.addEventListener("click", onClick);
  return b;
}

/** The honesty landing: this is a game, here's what's real vs. modeled. Click-through. */
function renderSplash(): void {
  document.body.classList.remove("layout-play");
  clear();
  root.appendChild(header());
  const f = splashFacts();

  const make = (tag: string, cls: string, text?: string): HTMLElement => {
    const n = document.createElement(tag);
    n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  const section = document.createElement("section");
  section.className = "splash";

  section.appendChild(make("p", "splash__eyebrow", SPLASH.eyebrow));
  section.appendChild(make("h2", "splash__title", SPLASH.title));
  section.appendChild(make("p", "splash__lede", SPLASH.lede));

  // Provenance, up top and legible: the two official reports everything is built from.
  const src = make("div", "splash__sources");
  src.appendChild(make("span", "splash__sources-label", SPLASH.sourcesLabel));
  const srcList = make("ul", "splash__sources-list");
  for (const s of SPLASH.sources) srcList.appendChild(make("li", "", s));
  src.appendChild(srcList);
  section.appendChild(src);

  // By-the-numbers strip — every value injected from splashFacts (no literals).
  const strip = make("div", "splash__stats");
  for (const s of SPLASH.stats) {
    const stat = make("div", "splash__stat");
    stat.appendChild(make("span", "splash__stat-num", String(f[s.key])));
    stat.appendChild(make("span", "splash__stat-label", s.label));
    strip.appendChild(stat);
  }
  section.appendChild(strip);

  // The real-vs-model blocks. `kind` colors the left rule (real = blue, model = red).
  const blocks: Array<{ head: string; body: string; kind: "real" | "model" }> = [
    { head: SPLASH.realHead, body: SPLASH.realBody(f), kind: "model" },
    { head: SPLASH.compressHead, body: SPLASH.compressBody(f), kind: "model" },
    { head: SPLASH.layeredHead, body: SPLASH.layeredBody(f), kind: "model" },
    { head: SPLASH.faithfulHead, body: SPLASH.faithfulBody(f), kind: "real" },
    { head: SPLASH.pointHead, body: SPLASH.pointBody, kind: "real" },
  ];
  const grid = make("div", "splash__blocks");
  for (const b of blocks) {
    const block = make("div", `splash__block splash__block--${b.kind}`);
    block.appendChild(make("h3", "splash__block-head", b.head));
    block.appendChild(make("p", "splash__block-body", b.body));
    grid.appendChild(block);
  }
  section.appendChild(grid);

  // CTA.
  section.appendChild(button(SPLASH.cta, "choice splash__cta", renderTargetScreen));

  // Byline + portfolio links.
  const foot = make("div", "splash__byline");
  foot.appendChild(make("p", "splash__byline-name", SPLASH.byline));
  foot.appendChild(make("p", "splash__byline-note", SPLASH.bylineNote));
  const links = make("p", "splash__links");
  SPLASH.links.forEach((lk, i) => {
    if (i > 0) links.appendChild(document.createTextNode(" · "));
    const a = document.createElement("a");
    a.className = "splash__link";
    a.href = lk.href;
    a.textContent = lk.label;
    links.appendChild(a);
  });
  foot.appendChild(links);
  section.appendChild(foot);

  root.appendChild(section);
}

function renderTargetScreen(): void {
  document.body.classList.remove("layout-play");
  clear();
  root.appendChild(header());
  const section = document.createElement("section");
  section.className = "targets";
  const h = document.createElement("h2");
  h.textContent = UI.chooseTarget;
  section.appendChild(h);

  for (const t of ["near_term", "durable", "stretch"] as Target[]) {
    const copy = TARGET_COPY[t];
    const card = document.createElement("button");
    card.className = "target";
    const name = document.createElement("span");
    name.className = "target__name";
    name.textContent = copy.name;
    const blurb = document.createElement("span");
    blurb.className = "target__blurb";
    blurb.textContent = copy.blurb;
    card.append(name, blurb);
    card.addEventListener("click", () => startGame(t));
    section.appendChild(card);
  }
  root.appendChild(section);
}

function startGame(t: Target): void {
  target = t;
  choices = new Array(DECISIONS.length).fill(null);
  current = 0;
  flash = null;
  renderIntro();
}

/** Opening stakes + an explainer of the four gauges. Gap figure from the target. */
function renderIntro(): void {
  if (target === null) return renderTargetScreen();
  document.body.classList.remove("layout-play");
  clear();
  root.appendChild(header());

  const section = document.createElement("section");
  section.className = "intro";
  const p = document.createElement("p");
  p.className = "intro__stakes";
  p.textContent = INTRO(formatUSD(targetAmount(target)));
  section.appendChild(p);

  const h = document.createElement("h2");
  h.textContent = UI.gaugesTitle;
  section.appendChild(h);
  const list = document.createElement("ul");
  list.className = "gauges";
  for (const key of [
    "gap_progress",
    "political_capital",
    "equity",
    "long_term_health",
  ] as const) {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.className = "gauges__name";
    name.textContent = METER_LABELS[key];
    li.append(name, document.createTextNode(` — ${METER_HELP[key]}`));
    list.appendChild(li);
  }
  section.appendChild(list);

  section.appendChild(button(UI.begin, "choice", renderPlay));
  root.appendChild(section);
}

function renderPlay(): void {
  if (target === null) return renderTargetScreen();
  document.body.classList.add("layout-play");
  const game = rebuild();
  clear();
  root.appendChild(header(actFor(current).number)); // masthead with act-star rank
  root.appendChild(renderMeters(game)); // sticky status HUD (full width)

  // Two-column play area: decision (focus) on the left, plan/ledger on the right.
  // Source order is main → aside, so on mobile the card stacks above the map.
  const play = document.createElement("div");
  play.className = "play";

  const mainCol = document.createElement("main");
  mainCol.className = "play__main";

  // V2: the consequence bite from the choice just made lands here, before the card.
  if (flash !== null) {
    const f = document.createElement("div");
    f.className = "flash";
    f.textContent = flash;
    mainCol.appendChild(f);
  }

  const decision = DECISIONS[current]!;
  mainCol.appendChild(
    renderDecision(decision, current + 1, DECISIONS.length, target, choices[current] ?? null, onChoose),
  );
  const nav = document.createElement("nav");
  nav.className = "nav";
  nav.appendChild(button(UI.back, "nav__btn", () => goTo(current - 1), current === 0));
  nav.appendChild(
    button(UI.next, "nav__btn", () => goTo(current + 1), current === DECISIONS.length - 1),
  );
  nav.appendChild(button(UI.seeEnding, "nav__btn nav__btn--end", renderEnding));
  mainCol.appendChild(nav);

  const aside = document.createElement("aside");
  aside.className = "play__aside";
  aside.appendChild(renderDecisionMap(DECISIONS, choices, current, jumpTo));
  aside.appendChild(renderLedger(game));

  play.append(mainCol, aside);
  root.appendChild(play);
}

function onChoose(choice: string): void {
  const wasUndecided = choices[current] === null;
  choices[current] = choice;
  // V2: compute the consequence bite for THIS decision (applied to a fresh game so
  // the bite reflects only this lever's outcome under the chosen target).
  flash = biteFor(DECISIONS[current]!.id, choice);
  // Auto-advance only when first deciding; revising stays put so the change is seen.
  if (wasUndecided && current < DECISIONS.length - 1) current += 1;
  renderPlay();
}

/** First non-null consequence bite across a decision's emitted outcome(s) (V2). */
function biteFor(decisionId: string, choice: string): string | null {
  if (target === null) return null;
  for (const o of applyChoice(createGame(target), decisionId, choice).outcomes) {
    const b = biteLine(o, target);
    if (b) return b;
  }
  return null;
}

function goTo(index: number): void {
  flash = null; // a deliberate navigation clears the just-made-choice bite
  current = Math.max(0, Math.min(DECISIONS.length - 1, index));
  renderPlay();
}

function jumpTo(index: number): void {
  goTo(index);
}

function renderEnding(): void {
  if (target === null) return renderTargetScreen();
  document.body.classList.remove("layout-play");
  const game = rebuild();
  clear();
  root.appendChild(header());
  root.appendChild(renderMeters(game));

  const ending = evaluateEnding(game);
  const s = shortfall(game);
  const section = document.createElement("section");
  section.className = "ending";
  const h = document.createElement("h2");
  h.textContent = ending;
  const p = document.createElement("p");
  p.textContent = ENDING_COPY[ending];
  section.append(h, p);

  const closedPct = `${(Math.max(0, s.pct) * 100).toFixed(0)}%`;
  const line = document.createElement("p");
  line.className = "ending__shortfall";
  line.textContent = SHORTFALL_LINE({ pct: closedPct, short: formatUSD(s.short) });
  section.appendChild(line);
  const drama = ENDING_DRAMA[ending];
  if (drama) {
    const d = document.createElement("p");
    d.className = "ending__drama";
    d.textContent = drama;
    section.appendChild(d);
  }

  section.appendChild(button(UI.reviseChoices, "choice", renderPlay));
  section.appendChild(button(UI.playAgain, "choice", renderTargetScreen));
  root.appendChild(section);
  root.appendChild(renderLedger(game));
}

// v2 routing (REVAMP §5): #follow, #gap, #grow, #math and #sources render the v2
// pages; an empty or unknown hash keeps the v1 game exactly as it was.
const V1_TITLE = document.title;
let onV2Page = false;
function route(): void {
  const r = parseRoute(location.hash);
  if (r) {
    onV2Page = true;
    renderPage(root, r, copyFor(r.params.lang === "es" ? "es" : "en"));
  } else if (onV2Page || root.childElementCount === 0) {
    onV2Page = false;
    document.title = V1_TITLE;
    renderSplash();
  }
}
window.addEventListener("hashchange", route);
route();
