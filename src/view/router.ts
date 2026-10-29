// v2 page routing (REVAMP §5). Pure hash <-> route parsing, DOM-free, so a shared
// link like `#gap?plan=...` reopens the same page and state with no server.
// An empty or unknown hash returns null: the caller keeps the legacy v1 landing.

/** The five v2 pages, in reading order. */
export const PAGES = ["follow", "gap", "grow", "math", "sources"] as const;

export type Page = (typeof PAGES)[number];

export interface Route {
  page: Page;
  params: Record<string, string>;
}

function isPage(value: string): value is Page {
  return (PAGES as readonly string[]).includes(value);
}

/** Parse `#page?key=value&...` into a Route, or null for an empty/unknown page. */
export function parseRoute(hash: string): Route | null {
  const body = hash.startsWith("#") ? hash.slice(1) : hash;
  const [page = "", query = ""] = body.split(/\?(.*)/s, 2);
  if (!isPage(page)) return null;
  const params: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(query)) params[key] = value;
  return { page, params };
}

/** Format a Route back into a hash. parseRoute(formatRoute(r)) round-trips. */
export function formatRoute(route: Route): string {
  const query = new URLSearchParams(route.params).toString();
  return query === "" ? `#${route.page}` : `#${route.page}?${query}`;
}
