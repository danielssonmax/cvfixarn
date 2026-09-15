/**
 * Visual themes layered on top of the standard CV markup.
 *
 * Why themes instead of ten more generate-cv-html-*.ts files:
 *
 * The five original templates each ship their own generator plus a matching CSS
 * block duplicated across three surfaces (the live preview, the Paged.js print
 * page, and the thumbnail). Adding ten more that way would mean ~15k lines of
 * near-identical code and thirty CSS blocks to keep in sync.
 *
 * Instead, every theme here reuses `generateCVHtml` verbatim — the same markup
 * and the same class names as the standard template. That buys three things for
 * free: the existing single-column pagination in resume-preview.tsx works
 * untouched, the PDF pipeline works untouched, and a theme is expressed purely
 * as CSS scoped under `.cv-theme-<id>`.
 *
 * The five original templates are deliberately not registered here and none of
 * their code or CSS is modified.
 *
 * Constraints these designs are built around:
 *   - No full-bleed colour bands. The print page lays out via Paged.js with
 *     `@page { margin: 18mm 15mm }`, and negative margins that try to escape
 *     that box do not survive reliably. Everything stays inside the content box,
 *     so the PDF the user pays for matches the preview.
 *   - Headings only use fonts that need no webfont: Georgia for serif and
 *     Courier New for mono both render in Chromium/Puppeteer. The print surface
 *     only imports Poppins and Inter, so anything else would silently fall back.
 *   - Single column, real text, no icon-only content — these have to stay
 *     ATS-parsable, which is the product's whole promise.
 */

export type ThemePreviewKind =
  | "rule"
  | "card"
  | "bar"
  | "centered"
  | "mono"
  | "portrait"
  | "overline"
  | "pill"

export interface CvTheme {
  id: string
  /** Swedish name shown in the picker. */
  name: string
  /** One-line Swedish description for the picker. */
  description: string
  /** Default accent colour. */
  accent: string
  /** Font to switch the document to when this theme is picked. */
  font: string
  /** Drives the shape of the miniature preview in the editor menu. */
  previewKind: ThemePreviewKind
  /** CSS body, scoped by the caller under `.cv-theme-<id>`. */
  css: (c: ThemeColors) => string
}

export interface ThemeColors {
  accent: string
  /** Accent at ~12% alpha — backgrounds. */
  accentTint: string
  /** Accent at ~28% alpha — hairlines and borders. */
  accentSoft: string
  /** Headings. */
  ink: string
  /** Body copy. */
  body: string
  /** Secondary copy, dates. */
  muted: string
  /** Hairlines. */
  line: string
}

/* ------------------------------------------------------------------ colours */

/** #rrggbb (or #rgb) → `rgba(r, g, b, a)`. Returns the input if unparsable. */
export function withAlpha(hex: string, alpha: number): string {
  const normalised = normaliseHex(hex)
  if (!normalised) return hex
  const [r, g, b] = normalised
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function normaliseHex(hex: string): [number, number, number] | null {
  if (typeof hex !== "string") return null
  let value = hex.trim().replace(/^#/, "")
  if (value.length === 3) {
    value = value
      .split("")
      .map((ch) => ch + ch)
      .join("")
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ]
}

/**
 * The editor defaults `header_color` to #000000, so honouring it blindly would
 * flatten every theme to black and throw the design away. Treat the untouched
 * defaults as "no choice made" and keep the theme's own accent; once the user
 * actually picks a colour, their choice wins.
 */
const DEFAULT_HEADER_COLORS = new Set(["#000000", "#000", "#111827"])

export function resolveAccent(theme: CvTheme, headerColor?: string): string {
  if (!headerColor) return theme.accent
  const normalised = headerColor.trim().toLowerCase()
  if (DEFAULT_HEADER_COLORS.has(normalised)) return theme.accent
  return normaliseHex(normalised) ? headerColor : theme.accent
}

function paletteFor(accent: string): ThemeColors {
  return {
    accent,
    accentTint: withAlpha(accent, 0.1),
    accentSoft: withAlpha(accent, 0.28),
    ink: "#111827",
    body: "#4B5563",
    muted: "#6B7280",
    line: "#E5E7EB",
  }
}

/* --------------------------------------------------------------- shared css */

/**
 * Neutralises the standard template's opinions (black header rule, grey chips,
 * fixed section underline) so each theme starts from a predictable base and
 * only has to describe what makes it different.
 */
function reset(c: ThemeColors): string {
  return `
  .cv-header {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 26px;
  }
  .cv-name { color: ${c.ink}; }
  .cv-title { color: ${c.body}; }
  .cv-contact { color: ${c.muted}; }
  .cv-section { margin-bottom: 22px; }
  .cv-section-title {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 12px;
  }
  .cv-item-title { color: ${c.ink}; }
  .cv-item-date { color: ${c.muted}; }
  .cv-item-company { color: ${c.body}; }
  .cv-item-location { color: ${c.muted}; }
  .cv-item-description { color: ${c.body}; }
  .cv-skill-item,
  .cv-language-item {
    background: none;
    color: ${c.body};
    border-radius: 0;
    padding: 0;
    margin: 0 14px 5px 0;
  }
  .cv-page-break { border-top: 1px solid ${c.line}; }`
}

/* ------------------------------------------------------------------- themes */

export const CV_THEMES: CvTheme[] = [
  {
    id: "nordisk",
    name: "Nordisk",
    description: "Luftig skandinavisk design med tunna linjer och dämpad blå accent",
    accent: "#3E5C76",
    font: "Inter",
    previewKind: "rule",
    css: (c) => `
  ${reset(c)}
  .cv-header {
    border-bottom: 1px solid ${c.line};
    padding-bottom: 18px;
    margin-bottom: 28px;
  }
  .cv-name {
    font-size: 2.3em;
    font-weight: 300;
    letter-spacing: 0.5px;
  }
  .cv-title {
    font-size: 0.82em;
    text-transform: uppercase;
    letter-spacing: 2.4px;
    color: ${c.accent};
    font-weight: 500;
    margin-top: 4px;
  }
  .cv-contact { font-size: 0.85em; margin-top: 12px; }
  .cv-section-title {
    font-size: 0.74em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.8px;
    color: ${c.accent};
    padding-bottom: 7px;
    position: relative;
  }
  .cv-section-title::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 30px;
    height: 2px;
    background: ${c.accent};
  }
  .cv-item-title { font-size: 1.04em; font-weight: 600; }
  .cv-item-date { font-size: 0.82em; font-variant-numeric: tabular-nums; }
  .cv-item-company { font-size: 0.94em; font-weight: 500; }
  .cv-skill-item,
  .cv-language-item {
    border: 1px solid ${c.accentSoft};
    border-radius: 999px;
    padding: 3px 11px;
    margin: 0 6px 6px 0;
    font-size: 0.84em;
    color: ${c.accent};
  }`,
  },

  {
    id: "oslo",
    name: "Oslo",
    description: "Modern teal-accent med namnet i ett tonat fält och tydliga rubriker",
    accent: "#0F766E",
    font: "Poppins",
    previewKind: "card",
    css: (c) => `
  ${reset(c)}
  .cv-header {
    background: ${c.accentTint};
    border-left: 4px solid ${c.accent};
    padding: 18px 20px;
    margin-bottom: 26px;
  }
  .cv-name {
    font-size: 2em;
    font-weight: 700;
    color: ${c.accent};
    letter-spacing: -0.3px;
  }
  .cv-title {
    font-size: 1em;
    font-weight: 500;
    margin-top: 2px;
  }
  .cv-contact { font-size: 0.85em; margin-top: 10px; }
  .cv-section-title {
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.4px;
    color: ${c.accent};
    border-bottom: 2px solid ${c.accentSoft};
    padding-bottom: 6px;
  }
  .cv-item-title { font-size: 1.04em; font-weight: 600; }
  .cv-item-date {
    font-size: 0.8em;
    font-weight: 600;
    color: ${c.accent};
  }
  .cv-item-company { font-size: 0.94em; }
  .cv-skill-item,
  .cv-language-item {
    background: ${c.accentTint};
    color: ${c.accent};
    border-radius: 4px;
    padding: 4px 10px;
    margin: 0 6px 6px 0;
    font-size: 0.85em;
    font-weight: 500;
  }`,
  },

  {
    id: "akademisk",
    name: "Akademisk",
    description: "Klassisk serif med centrerad rubrik – passar forskning och utbildning",
    accent: "#1F2937",
    font: "Georgia",
    previewKind: "centered",
    css: (c) => `
  ${reset(c)}
  .cv-header {
    display: block;
    text-align: center;
    border-bottom: 3px double ${c.ink};
    padding-bottom: 14px;
    margin-bottom: 26px;
  }
  .cv-header-content { align-items: center; }
  .cv-name {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 2.15em;
    font-weight: 400;
    letter-spacing: 1.5px;
  }
  .cv-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1em;
    font-style: italic;
    margin-top: 4px;
  }
  .cv-contact {
    justify-content: center;
    font-size: 0.84em;
    margin-top: 10px;
  }
  .cv-profile-image {
    margin: 0 auto 14px;
    width: 96px;
    height: 96px;
    border-radius: 50%;
  }
  .cv-section-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 0.86em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2.2px;
    color: ${c.ink};
    border-bottom: 1px solid ${c.ink};
    padding-bottom: 5px;
  }
  .cv-item-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.05em;
    font-weight: 700;
  }
  .cv-item-date { font-size: 0.85em; font-style: italic; }
  .cv-item-company { font-size: 0.95em; font-style: italic; }
  .cv-skill-item,
  .cv-language-item {
    font-size: 0.9em;
    margin: 0 0 4px 0;
    padding-right: 10px;
  }
  .cv-skill-item:not(:last-child)::after,
  .cv-language-item:not(:last-child)::after {
    content: "·";
    margin-left: 10px;
    color: ${c.muted};
  }`,
  },

  {
    id: "affar",
    name: "Affär",
    description: "Marinblå företagsstil med fyllda rubrikband för tydlig struktur",
    accent: "#1E3A8A",
    font: "Inter",
    previewKind: "bar",
    css: (c) => `
  ${reset(c)}
  .cv-header {
    border-left: 5px solid ${c.accent};
    padding-left: 16px;
    margin-bottom: 24px;
  }
  .cv-name {
    font-size: 2.05em;
    font-weight: 700;
    color: ${c.accent};
    letter-spacing: -0.4px;
  }
  .cv-title {
    font-size: 0.86em;
    text-transform: uppercase;
    letter-spacing: 1.8px;
    font-weight: 600;
    margin-top: 4px;
  }
  .cv-contact { font-size: 0.85em; margin-top: 10px; }
  .cv-section-title {
    font-size: 0.76em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #FFFFFF;
    background: ${c.accent};
    padding: 5px 11px;
    margin-bottom: 13px;
  }
  .cv-item { padding-left: 11px; border-left: 2px solid ${c.line}; }
  .cv-experience-item { padding-left: 11px; border-left: 2px solid ${c.line}; }
  .cv-item-title { font-size: 1.02em; font-weight: 700; }
  .cv-item-date {
    font-size: 0.8em;
    font-weight: 600;
    color: ${c.accent};
    white-space: nowrap;
  }
  .cv-item-company { font-size: 0.93em; font-weight: 500; }
  .cv-skill-item,
  .cv-language-item {
    border: 1px solid ${c.accentSoft};
    color: ${c.accent};
    padding: 3px 10px;
    margin: 0 6px 6px 0;
    font-size: 0.84em;
    font-weight: 500;
  }`,
  },

  {
    id: "kontrast",
    name: "Kontrast",
    description: "Stor namnrubrik mot fin text – tydlig hierarki och diskreta accentstreck",
    accent: "#1C1917",
    font: "Poppins",
    previewKind: "portrait",
    css: (c) => `
  ${reset(c)}
  .cv-header {
    align-items: center;
    border-bottom: 1px solid ${c.ink};
    padding-bottom: 20px;
    margin-bottom: 26px;
  }
  .cv-name {
    font-size: 2.6em;
    font-weight: 700;
    letter-spacing: -1.2px;
    line-height: 1.05;
  }
  .cv-title {
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: ${c.muted};
    font-weight: 500;
    margin-top: 8px;
  }
  .cv-contact { font-size: 0.84em; margin-top: 12px; }
  .cv-profile-image {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    border: 2px solid ${c.ink};
  }
  .cv-section-title {
    font-size: 0.74em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: ${c.ink};
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cv-section-title::before {
    content: "";
    width: 20px;
    height: 2px;
    background: ${c.accent};
    flex-shrink: 0;
  }
  .cv-item-title { font-size: 1.05em; font-weight: 600; }
  .cv-item-date { font-size: 0.82em; letter-spacing: 0.4px; }
  .cv-item-company { font-size: 0.93em; }
  .cv-skill-item,
  .cv-language-item {
    font-size: 0.87em;
    border-bottom: 1px solid ${c.accentSoft};
    padding: 0 0 2px 0;
    margin: 0 12px 7px 0;
    color: ${c.ink};
  }`,
  },

  {
    id: "kompakt",
    name: "Kompakt",
    description: "Tät layout som får plats med mycket innehåll på få sidor",
    accent: "#374151",
    font: "Inter",
    previewKind: "rule",
    css: (c) => `
  ${reset(c)}
  .cv-header {
    border-bottom: 2px solid ${c.ink};
    padding-bottom: 10px;
    margin-bottom: 16px;
  }
  .cv-name {
    font-size: 1.72em;
    font-weight: 700;
    letter-spacing: -0.3px;
    margin-bottom: 2px;
  }
  .cv-title { font-size: 0.9em; margin-top: 0; margin-bottom: 4px; }
  .cv-contact { font-size: 0.78em; margin-top: 5px; }
  .cv-contact-item { margin-right: 11px; }
  .cv-section { margin-bottom: 13px; }
  .cv-section-title {
    font-size: 0.7em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.3px;
    color: ${c.accent};
    border-bottom: 1px solid ${c.line};
    padding-bottom: 3px;
    margin-bottom: 7px;
  }
  .cv-item,
  .cv-experience-item { margin-bottom: 9px; }
  .cv-item-header { margin-bottom: 2px; }
  .cv-item-title { font-size: 0.96em; font-weight: 600; margin-bottom: 1px; }
  .cv-item-date { font-size: 0.78em; }
  .cv-item-company { font-size: 0.87em; margin-bottom: 1px; }
  .cv-item-location { font-size: 0.79em; margin-bottom: 2px; }
  .cv-item-description { font-size: 0.87em; line-height: 1.42; }
  .cv-skill-item,
  .cv-language-item {
    font-size: 0.8em;
    background: #F3F4F6;
    border-radius: 3px;
    padding: 2px 7px;
    margin: 0 4px 4px 0;
  }`,
  },

  {
    id: "accent",
    name: "Accent",
    description: "Frisk grön profil med markerade rubriker – modern och lättläst",
    accent: "#00BF63",
    font: "Poppins",
    previewKind: "bar",
    css: (c) => `
  ${reset(c)}
  .cv-name {
    font-size: 2.25em;
    font-weight: 700;
    letter-spacing: -0.6px;
    padding-bottom: 8px;
    position: relative;
  }
  .cv-name::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 56px;
    height: 4px;
    background: ${c.accent};
    border-radius: 2px;
  }
  .cv-title {
    font-size: 0.98em;
    font-weight: 500;
    margin-top: 10px;
  }
  .cv-contact { font-size: 0.85em; margin-top: 10px; }
  .cv-section-title {
    font-size: 0.78em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.4px;
    color: ${c.ink};
    border-left: 4px solid ${c.accent};
    padding: 1px 0 1px 10px;
  }
  .cv-item-title { font-size: 1.03em; font-weight: 600; }
  .cv-item-date {
    font-size: 0.81em;
    font-weight: 600;
    color: ${c.muted};
  }
  .cv-item-company { font-size: 0.94em; font-weight: 500; }
  .cv-skill-item,
  .cv-language-item {
    background: ${c.accentTint};
    color: #047857;
    border-radius: 999px;
    padding: 4px 12px;
    margin: 0 6px 6px 0;
    font-size: 0.85em;
    font-weight: 500;
  }`,
  },

  {
    id: "slate",
    name: "Slate",
    description: "Återhållsam gråskala med linjer över rubrikerna och stort namn",
    accent: "#64748B",
    font: "Inter",
    previewKind: "overline",
    css: (c) => `
  ${reset(c)}
  .cv-header { margin-bottom: 30px; }
  .cv-name {
    font-size: 2.7em;
    font-weight: 200;
    text-transform: uppercase;
    letter-spacing: 4px;
    line-height: 1.15;
  }
  .cv-title {
    font-size: 0.84em;
    text-transform: uppercase;
    letter-spacing: 2.6px;
    color: ${c.accent};
    font-weight: 500;
    margin-top: 8px;
  }
  .cv-contact { font-size: 0.83em; margin-top: 12px; }
  .cv-section-title {
    font-size: 0.72em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2.2px;
    color: ${c.accent};
    border-top: 1px solid ${c.line};
    padding-top: 9px;
    margin-bottom: 13px;
  }
  .cv-item-header { flex-direction: column; align-items: flex-start; }
  .cv-item-date {
    font-size: 0.76em;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    margin-left: 0;
    margin-bottom: 3px;
    order: -1;
  }
  .cv-item-title { font-size: 1.05em; font-weight: 600; }
  .cv-item-company { font-size: 0.93em; }
  .cv-skill-item,
  .cv-language-item {
    font-size: 0.86em;
    margin: 0 16px 6px 0;
    color: ${c.ink};
  }`,
  },

  {
    id: "varm",
    name: "Varm",
    description: "Varm terrakotta med mjuka former – personlig men fortfarande proper",
    accent: "#C2410C",
    font: "Poppins",
    previewKind: "pill",
    css: (c) => `
  ${reset(c)}
  .cv-header {
    background: ${c.accentTint};
    border-radius: 12px;
    padding: 20px 22px;
    margin-bottom: 24px;
  }
  .cv-name {
    font-size: 2.1em;
    font-weight: 600;
    color: ${c.accent};
    letter-spacing: -0.3px;
  }
  .cv-title { font-size: 0.98em; margin-top: 3px; }
  .cv-contact { font-size: 0.85em; margin-top: 10px; }
  .cv-profile-image { border-radius: 14px; width: 96px; height: 96px; }
  .cv-section-title {
    font-size: 0.76em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.4px;
    color: ${c.accent};
    background: ${c.accentTint};
    border-radius: 999px;
    padding: 5px 14px;
    display: inline-block;
  }
  .cv-item-title { font-size: 1.03em; font-weight: 600; }
  .cv-item-date { font-size: 0.82em; }
  .cv-item-company { font-size: 0.94em; font-weight: 500; }
  .cv-skill-item,
  .cv-language-item {
    background: ${c.accentTint};
    color: ${c.accent};
    border-radius: 999px;
    padding: 4px 13px;
    margin: 0 6px 6px 0;
    font-size: 0.85em;
    font-weight: 500;
  }`,
  },

  {
    id: "teknisk",
    name: "Teknisk",
    description: "Monospace-rubriker och blå accent – gjord för utvecklare och data",
    accent: "#2563EB",
    font: "Inter",
    previewKind: "mono",
    css: (c) => `
  ${reset(c)}
  .cv-header {
    border-bottom: 2px solid ${c.accent};
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .cv-name {
    font-size: 2.1em;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .cv-title {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 0.85em;
    color: ${c.accent};
    letter-spacing: 0.4px;
    margin-top: 5px;
  }
  .cv-contact {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 0.8em;
    margin-top: 11px;
  }
  .cv-section-title {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 0.82em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${c.accent};
    padding-bottom: 6px;
    border-bottom: 1px dashed ${c.accentSoft};
  }
  .cv-section-title::before {
    content: "// ";
    color: ${c.accentSoft};
  }
  .cv-item-title { font-size: 1.02em; font-weight: 600; }
  .cv-item-date {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 0.8em;
    color: ${c.accent};
  }
  .cv-item-company { font-size: 0.93em; font-weight: 500; }
  .cv-skill-item,
  .cv-language-item {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 0.82em;
    border: 1px solid ${c.accentSoft};
    color: ${c.accent};
    padding: 2px 8px;
    margin: 0 5px 5px 0;
  }`,
  },
]

/* ------------------------------------------------------------------ lookups */

const THEME_BY_ID = new Map(CV_THEMES.map((theme) => [theme.id, theme]))

export const CV_THEME_IDS: string[] = CV_THEMES.map((theme) => theme.id)

export function getCvTheme(id: string | undefined | null): CvTheme | undefined {
  if (!id) return undefined
  return THEME_BY_ID.get(id)
}

/** True when `id` is one of the new themes rather than an original template. */
export function isCvTheme(id: string | undefined | null): boolean {
  return !!id && THEME_BY_ID.has(id)
}

/** `cv-theme-<id>`, or "" for the five original templates. */
export function cvThemeClass(id: string | undefined | null): string {
  return isCvTheme(id) ? `cv-theme-${id}` : ""
}

/**
 * CSS for the active theme only — returns "" for the original templates so
 * nothing is injected on their pages.
 *
 * Every rule is emitted as `.cv-theme-<id> <selector>`, which outranks the
 * single-class base rules on specificity alone. No !important needed, and no
 * ordering requirement relative to the existing stylesheet.
 */
export function buildCvThemeCss(
  activeTemplateId: string | undefined | null,
  options: { headerColor?: string } = {}
): string {
  const theme = getCvTheme(activeTemplateId)
  if (!theme) return ""

  const accent = resolveAccent(theme, options.headerColor)
  const body = theme.css(paletteFor(accent))
  const scope = `.cv-theme-${theme.id}`

  // Prefix each selector in the block with the theme scope.
  return body.replace(
    /(^|\})\s*([^{}@]+)\s*\{/g,
    (_match, brace: string, selectors: string) => {
      const scoped = selectors
        .split(",")
        .map((selector) => selector.trim())
        .filter(Boolean)
        .map((selector) => `${scope} ${selector}`)
        .join(",\n")
      return `${brace}\n${scoped} {`
    }
  )
}
