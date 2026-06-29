// Mayor-mode view entry point. Drives the engine and renders each screen. All game
// logic is in the engine; this file wires DOM events to engine calls. The player can
// move back/forward and jump between decisions, so state is a per-decision choice
// array that we replay through the (pure) engine to derive the live GameState.

import "./style.css";
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
import { shortfall, actFor } from "./narrative";
import {
  TITLE,
  SUBTITLE,
  MASTHEAD_EYEBROW,
  TARGET_COPY,
  ENDING_COPY,
  ENDING_DRAMA,
  SHORTFALL_LINE,
  INTRO,
  METER_LABELS,
  METER_HELP,
  UI,
} from "./copy";

const root = document.getElementById("app")!;
const DECISIONS = availableDecisions();

let target: Target | null = null;
let choices: (string | null)[] = [];
let current = 0;

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
  // Auto-advance only when first deciding; revising stays put so the change is seen.
  if (wasUndecided && current < DECISIONS.length - 1) current += 1;
  renderPlay();
}

function goTo(index: number): void {
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

renderTargetScreen();
