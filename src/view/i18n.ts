// Language selection for v2 copy (REVAMP §5). English ships first; Spanish is
// written alongside from the start and ships in Phase 4.

import { en, type Copy } from "./copy.en";
import { es } from "./copy.es";

export const LANGS = ["en", "es"] as const;

export type Lang = (typeof LANGS)[number];

const COPY: Record<Lang, Copy> = { en, es };

/** The on-screen copy for a language. */
export function copyFor(lang: Lang): Copy {
  return COPY[lang];
}
