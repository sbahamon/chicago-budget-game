// Mayor-mode view entry point. Drives the engine through the fixed decision
// sequence and renders each step. All game logic is in the engine; this file only
// wires DOM events to engine calls and renders engine output.

import "./style.css";
import {
  createGame,
  applyChoice,
  availableDecisions,
  evaluateEnding,
  type GameState,
  type Target,
} from "../engine/index";
import { renderMeters, renderDecision, renderLedger } from "./render";
import {
  TITLE,
  SUBTITLE,
  TARGET_COPY,
  ENDING_COPY,
  UI,
} from "./copy";

const root = document.getElementById("app")!;
const DECISIONS = availableDecisions();

let game: GameState | null = null;
let step = 0;

function clear(): void {
  root.replaceChildren();
}

function header(): HTMLElement {
  const h = document.createElement("header");
  h.className = "site-header";
  const t = document.createElement("h1");
  t.textContent = TITLE;
  const s = document.createElement("p");
  s.textContent = SUBTITLE;
  h.append(t, s);
  return h;
}

function renderTargetScreen(): void {
  clear();
  root.appendChild(header());
  const section = document.createElement("section");
  section.className = "targets";
  const h = document.createElement("h2");
  h.textContent = UI.chooseTarget;
  section.appendChild(h);

  for (const target of ["near_term", "durable", "stretch"] as Target[]) {
    const copy = TARGET_COPY[target];
    const card = document.createElement("button");
    card.className = "target";
    const name = document.createElement("span");
    name.className = "target__name";
    name.textContent = copy.name;
    const blurb = document.createElement("span");
    blurb.className = "target__blurb";
    blurb.textContent = copy.blurb;
    card.append(name, blurb);
    card.addEventListener("click", () => startGame(target));
    section.appendChild(card);
  }
  root.appendChild(section);
}

function startGame(target: Target): void {
  game = createGame(target);
  step = 0;
  renderStep();
}

function renderStep(): void {
  if (game === null) return renderTargetScreen();
  if (step >= DECISIONS.length) return renderEnding();

  clear();
  root.appendChild(header());
  root.appendChild(renderMeters(game));

  const decision = DECISIONS[step]!;
  root.appendChild(
    renderDecision(decision, step + 1, DECISIONS.length, (choice) => {
      game = applyChoice(game!, decision.id, choice).state;
      step += 1;
      renderStep();
    }),
  );
  root.appendChild(renderLedger(game));
}

function renderEnding(): void {
  if (game === null) return renderTargetScreen();
  clear();
  root.appendChild(header());
  root.appendChild(renderMeters(game));

  const ending = evaluateEnding(game);
  const section = document.createElement("section");
  section.className = "ending";
  const h = document.createElement("h2");
  h.textContent = ending;
  const p = document.createElement("p");
  p.textContent = ENDING_COPY[ending];
  section.append(h, p);

  const again = document.createElement("button");
  again.className = "choice";
  again.textContent = UI.playAgain;
  again.addEventListener("click", renderTargetScreen);
  section.appendChild(again);

  root.appendChild(section);
  root.appendChild(renderLedger(game));
}

renderTargetScreen();
