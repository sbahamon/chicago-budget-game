// v2 on-screen text, Spanish (REVAMP §5). Same keys as copy.en.ts, enforced by the
// Copy type and by test/view/copy.test.ts. DRAFT translation: it needs review by a
// native Chicago Spanish speaker before the Spanish version ships in Phase 4.

import type { Copy } from "./copy.en";

export const es: Copy = {
  site: {
    title: "El juego del presupuesto de Chicago",
    tagline: "Sigue el dólar. Cierra el déficit. Haz crecer la base.",
  },
  nav: {
    follow: "Sigue el dólar",
    gap: "Cierra el déficit",
    grow: "Haz crecer la base",
    math: "Las cuentas",
    sources: "Fuentes",
  },
  pages: {
    follow: {
      title: "Sigue el dólar",
      lede: "De dónde viene el dinero de la ciudad y a dónde va. Luego, a dónde va tu factura del impuesto a la propiedad.",
    },
    gap: {
      title: "Cierra el déficit",
      lede: "Prueba opciones reales para arreglar el presupuesto. Mira lo que hace cada una en diez años, no solo en uno.",
    },
    grow: {
      title: "Haz crecer la base",
      lede: "Mira cuánto valor imponible produce cada cuadra. Luego mira qué cambia cuando la ciudad permite más viviendas.",
    },
    math: {
      title: "Las cuentas",
      lede: "Cada fórmula y cada supuesto detrás de nuestros números. No escondemos nada.",
    },
    sources: {
      title: "Fuentes",
      lede: "De dónde sale cada número de este sitio.",
    },
  },
  ui: {
    comingSoon: "Esta página todavía está en construcción.",
    backToGame: "Juega el juego del presupuesto actual",
    source: "Fuente",
    language: "Idioma",
  },
  glossary: {
    levy: {
      term: "Gravamen",
      definition:
        "La cantidad total de dinero que un gobierno decide cobrar en impuestos a la propiedad durante el año.",
    },
    taxRate: {
      term: "Tasa de impuesto",
      definition:
        "Tu parte del gravamen. El gravamen de cada gobierno se divide entre el valor imponible total de todas las propiedades de su zona.",
    },
    taxableValue: {
      term: "Valor imponible",
      definition:
        "Lo que el condado dice que vale una propiedad para fines de impuestos. Más casas y edificios significan más valor imponible.",
    },
    tifDistrict: {
      term: "Distrito TIF",
      definition:
        "Una zona donde la ciudad congela los impuestos a la propiedad que van a las escuelas, los parques y los demás. Durante hasta 23 años, cada dólar de crecimiento sobre esa cantidad congelada va a un fondo TIF aparte.",
    },
    tifSurplus: {
      term: "Excedente TIF",
      definition:
        "Dinero que la ciudad decide liberar de los fondos TIF. Por ley, se reparte entre todos los gobiernos de tu factura, no solo la ciudad.",
    },
    corporateFund: {
      term: "Fondo Corporativo",
      definition:
        "El presupuesto principal de la ciudad para el día a día: policía, bomberos, calles y servicios parecidos. Casi todas las peleas del presupuesto son por este fondo.",
    },
    oneTimeMoney: {
      term: "Dinero de una sola vez",
      definition: "Dinero que ayuda solo este año. El próximo año, el déficit vuelve.",
    },
    recurringMoney: {
      term: "Dinero recurrente",
      definition: "Dinero que ayuda todos los años.",
    },
    springfield: {
      term: "Springfield",
      definition:
        "El gobierno del estado de Illinois. Algunas opciones necesitan una ley estatal antes de que la ciudad pueda usarlas.",
    },
  },
};
