import dynamic from 'next/dynamic'
import { CV_THEMES } from '@/lib/cv-templates/themes'

const DefaultTemplate = dynamic(() => import('./default-template').then(mod => mod.DefaultTemplate))

/**
 * The five original templates. Each has its own generator in lib/generate-cv-html*.ts.
 */
const baseTemplates = [
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

/**
 * The themed templates. These share the standard generator and differ only in
 * CSS, so they are derived from the theme list rather than hand-listed here —
 * adding a theme in lib/cv-templates/themes.ts is enough to make it appear.
 */
const themedTemplates = CV_THEMES.map((theme) => ({
  id: theme.id,
  name: theme.name,
  description: theme.description,
  preview: `/images/templates/cv-mall-${theme.id}.png`,
  component: DefaultTemplate, // Placeholder - HTML genereras i generate-cv-html.ts + tema-CSS
}))

export const templates = [...baseTemplates, ...themedTemplates]
