/**
 * The body of an ad. Employers write it, so nothing in it is trusted.
 *
 * Ads only need basic text formatting: of 600 sampled ads every tag was one of
 * p, strong, em, u, ul, ol, li or br. So the markup is rebuilt from an
 * allowlist: listed tags are written back without any attributes, every other
 * tag is dropped and any stray angle bracket is escaped. No attribute survives,
 * which leaves nothing for a script, a link or a style to hide in.
 *
 * sanitizeHTML from lib/sanitize.ts is deliberately not used here. It is a
 * blocklist that lets unquoted event handlers through, and it deletes the
 * words "javascript:" and "data:" from running text, which turned
 * "Big Data: erfarenhet av ..." into "Big  erfarenhet av ..." in real ads.
 */

const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h3", "h4"]
const DROP_WITH_CONTENT = /<(script|style|title|head|textarea|select|svg|math)\b[\s\S]*?<\/\1\s*>/gi
const INLINE_TAG = /^(a|span|font|small|big|sub|sup|mark|code|s|del|ins|abbr|label)$/
// What is left in some ads where Platsbanken removed a link.
const DEAD_LINK = /\s*javascript:void\(0\);?/gi

// The page already has an h1 and h2s of its own.
const tagName = (name: string) => {
  const tag = name.toLowerCase()
  if (!/^h[1-6]$/.test(tag)) return tag
  return tag === "h4" || tag === "h5" || tag === "h6" ? "h4" : "h3"
}

export function cleanAdHtml(raw: string): string {
  const html = raw.replace(/<!--[\s\S]*?-->/g, "").replace(DROP_WITH_CONTENT, "").replace(DEAD_LINK, "")
  // Open tags are tracked and closed here rather than left to the browser: an
  // unclosed <strong> would otherwise keep going after the description.
  const open: string[] = []
  const closeDownTo = (index: number) => {
    let closed = ""
    while (open.length > index) closed += `</${open.pop()}>`
    return closed
  }

  const body = html.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>|[<>]/g, (match, slash, name) => {
    if (!name) return match === "<" ? "&lt;" : "&gt;"
    const tag = tagName(name)
    // A dropped block tag still separates words; a dropped inline tag does not.
    if (ALLOWED_TAGS.indexOf(tag) === -1) return INLINE_TAG.test(tag) ? "" : " "
    if (tag === "br") return "<br>"
    if (!slash) {
      open.push(tag)
      return `<${tag}>`
    }
    const index = open.lastIndexOf(tag)
    return index === -1 ? "" : closeDownTo(index)
  })
  // Many ads use <p>&nbsp;</p> as a blank line; paragraphs are already spaced.
  return (body + closeDownTo(0)).replace(/<p>(?:\s|&nbsp;|<br>)*<\/p>/g, "")
}

const hasMarkup = (value: string) => /<\/?[a-zA-Z][^>]*>/.test(value)
const hasText = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0

const bodyClass = "break-words text-base leading-relaxed text-ink-700"

export function JobDescription({ html, text }: { html: string | null; text: string | null }) {
  const cleaned = html && hasMarkup(html) ? cleanAdHtml(html) : ""

  if (cleaned && hasText(cleaned)) {
    return (
      <div
        className={`${bodyClass} [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_h4]:mb-2 [&_h4]:mt-5 [&_h4]:font-semibold [&_h4]:text-ink [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5`}
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
    )
  }

  // About one ad in ten is plain text with line breaks. React escapes it.
  const plain = text || (html && !hasMarkup(html) ? html : "") || ""
  const paragraphs = plain
    .replace(DEAD_LINK, "")
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  if (paragraphs.length === 0) return null

  return (
    <div className={bodyClass}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4 whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  )
}
