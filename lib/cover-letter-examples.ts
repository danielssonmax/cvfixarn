import letters from "@/data/cover-letter-examples.json"

/**
 * Cover-letter examples per profession, rendered by
 * app/exempel-personliga-brev/[slug]/page.tsx and listed on the hub page.
 * Content lives in data/cover-letter-examples.json so new batches can be added
 * without touching code.
 */
export type CoverLetterExample = {
  slug: string
  role: string
  /** Role as it reads mid-sentence ("som lagerarbetare"). */
  roleLower: string
  /** Matches a category name on the /exempel-personliga-brev hub. */
  category: string
  metaTitle: string
  metaDescription: string
  h1: string
  intro: string
  letter: {
    senderName: string
    senderContact: string
    subject: string
    greeting: string
    paragraphs: string[]
    closing: string
    signature: string
  }
  whyItWorks: { point: string; detail: string }[]
  highlights: string[]
  openings: string[]
  mistakes: { mistake: string; fix: string }[]
  faq: { q: string; a: string }[]
}

/** Shown as dateModified in structured data; bump when a batch is edited. */
export const COVER_LETTERS_UPDATED = "2026-11-03"

export const coverLetterExamples = letters as CoverLetterExample[]

export function getCoverLetterExample(slug: string): CoverLetterExample | undefined {
  return coverLetterExamples.find((example) => example.slug === slug)
}

/** CV example to link from a letter, where the slugs differ between the two sections. */
const CV_SLUG_FOR_LETTER: Record<string, string> = {
  servitris: "servitor-servitris",
}

export function cvSlugForLetter(letterSlug: string): string {
  return CV_SLUG_FOR_LETTER[letterSlug] ?? letterSlug
}

/** The letter as plain text, for the copy button. */
export function letterAsPlainText({ letter }: CoverLetterExample): string {
  return [
    letter.senderName,
    letter.senderContact,
    "",
    letter.subject,
    "",
    letter.greeting,
    "",
    ...letter.paragraphs.flatMap((paragraph) => [paragraph, ""]),
    letter.closing,
    letter.signature,
  ].join("\n")
}
