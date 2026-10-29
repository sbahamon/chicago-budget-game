// v2 page shells (REVAMP §5). Phase 0 adds routing only: each page shows its nav,
// title and one-line lede from the copy files. Phases 1–3 fill in the pages.

import type { Copy } from "./copy.en";
import { PAGES, formatRoute, type Route } from "./router";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function siteNav(route: Route, copy: Copy): HTMLElement {
  const nav = el("nav", "sitenav");
  nav.setAttribute("aria-label", copy.site.title);
  for (const page of PAGES) {
    const link = el("a", "sitenav__link", copy.nav[page]);
    link.href = formatRoute({ page, params: route.params.lang ? { lang: route.params.lang } : {} });
    if (page === route.page) link.setAttribute("aria-current", "page");
    nav.appendChild(link);
  }
  return nav;
}

/** Render one v2 page into `root`, replacing what was there. */
export function renderPage(root: HTMLElement, route: Route, copy: Copy): void {
  document.body.classList.remove("layout-play");
  document.title = `${copy.pages[route.page].title} · ${copy.site.title}`;

  const header = el("header", "masthead");
  const title = el("h1", "masthead__title");
  const star = el("span", "star", "✶");
  title.append(star, document.createTextNode(copy.site.title));
  header.append(title, el("p", "masthead__tag", copy.site.tagline), siteNav(route, copy));

  const page = copy.pages[route.page];
  const section = el("section", "splash");
  section.append(
    el("h2", "splash__title", page.title),
    el("p", "splash__lede", page.lede),
    el("p", "page__soon", copy.ui.comingSoon),
  );
  const back = el("a", "page__back", copy.ui.backToGame);
  back.href = "#";
  section.appendChild(back);

  root.replaceChildren(header, section);
}
