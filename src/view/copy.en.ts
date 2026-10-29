// v2 on-screen text, English (REVAMP §5, §7). Every v2 string lives here and in
// copy.es.ts with the same keys. Rules: write for someone who has never read a
// budget, keep sentences short (tested: none over 30 words), never say "EAV", and
// put no dollar or percent figure in copy — numbers come from the data at render.
// The legacy v1 game keeps its own copy.ts until Phase 2 replaces it.

export const en = {
  site: {
    title: "Chicago Budget Game",
    tagline: "Follow the dollar. Close the gap. Grow the base.",
  },
  nav: {
    follow: "Follow the dollar",
    gap: "Close the gap",
    grow: "Grow the base",
    math: "Math",
    sources: "Sources",
  },
  pages: {
    follow: {
      title: "Follow the dollar",
      lede: "Where the city's money comes from and where it goes. Then, where your property tax bill goes.",
    },
    gap: {
      title: "Close the gap",
      lede: "Try real options to fix the budget. See what each one does over ten years, not just one.",
    },
    grow: {
      title: "Grow the base",
      lede: "See how much tax value each block produces. Then see what changes when the city allows more homes.",
    },
    math: {
      title: "The math",
      lede: "Every formula and assumption behind our numbers. Nothing is hidden.",
    },
    sources: {
      title: "Sources",
      lede: "Where every number on this site comes from.",
    },
  },
  ui: {
    comingSoon: "This page is still being built.",
    backToGame: "Play the current budget game",
    source: "Source",
    language: "Language",
  },
  glossary: {
    levy: {
      term: "Levy",
      definition:
        "The total dollar amount a government decides to collect in property tax for the year.",
    },
    taxRate: {
      term: "Tax rate",
      definition:
        "Your share of the levy. Each government's levy is divided by the total taxable value of all property in its area.",
    },
    taxableValue: {
      term: "Taxable value",
      definition:
        "What the county says a property is worth for tax purposes. More homes and buildings mean more taxable value.",
    },
    tifDistrict: {
      term: "TIF district",
      definition:
        "An area where the city freezes the property taxes that go to schools, parks and the rest. For up to 23 years, every dollar of growth above that frozen amount goes into a separate TIF fund instead.",
    },
    tifSurplus: {
      term: "TIF surplus",
      definition:
        "Money the city decides to release from TIF funds. By law it's split among all the governments on your bill, not just the city.",
    },
    corporateFund: {
      term: "Corporate Fund",
      definition:
        "The city's main day-to-day budget for police, fire, streets and similar services. Most budget fights are about this fund.",
    },
    oneTimeMoney: {
      term: "One-time money",
      definition: "Money that helps this year only. Next year the gap comes back.",
    },
    recurringMoney: {
      term: "Recurring money",
      definition: "Money that helps every year.",
    },
    springfield: {
      term: "Springfield",
      definition:
        "The Illinois state government. Some options need a state law before the city can use them.",
    },
  },
};

/** The shape every language's copy must match (same keys, all strings). */
export type Copy = typeof en;
