import dynamic from 'next/dynamic'

const DefaultTemplate = dynamic(() => import('./default-template').then(mod => mod.DefaultTemplate))

export const templates = [
  {
    id: "default",
    name: "Standard",
    description: "En enkel och professionell mall som passar alla",
    preview: "/templates/default-preview.png",
    component: DefaultTemplate,
  },
  {
    id: "modern",
    name: "Modern",
    description: "En tvåkolumnsmall med sidebar för en modern look",
    preview: "/templates/modern-preview.png",
    component: DefaultTemplate, // Placeholder - HTML genereras i generate-cv-html-modern.ts
  },
  {
    id: "minimalist",
    name: "Minimalistisk",
    description: "Ren och elegant design med mycket whitespace",
    preview: "/templates/minimalist-preview.png",
    component: DefaultTemplate, // Placeholder - HTML genereras i generate-cv-html-minimalist.ts
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium design för seniora positioner",
    preview: "/templates/executive-preview.png",
    component: DefaultTemplate, // Placeholder - HTML genereras i generate-cv-html-executive.ts
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Visuell tidslinje för karriärsutveckling",
    preview: "/templates/timeline-preview.png",
    component: DefaultTemplate, // Placeholder - HTML genereras i generate-cv-html-timeline.ts
  },
]
