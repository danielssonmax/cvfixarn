/**
 * Turns an uploaded CV file into plain text.
 *
 * PDFs are read with pdf.js. Text items carry their position on the page, so we
 * rebuild real lines from them rather than trusting the order they happen to be
 * stored in, and we look for a vertical gutter first so that sidebar layouts are
 * read one column at a time instead of interleaving the two.
 */

export type SupportedCvFormat = "pdf" | "docx"

export function detectCvFormat(filename: string, mimeType?: string): SupportedCvFormat | null {
  const lower = (filename || "").toLowerCase()
  if (lower.endsWith(".pdf") || mimeType === "application/pdf") return "pdf"
  if (
    lower.endsWith(".docx") ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx"
  }
  return null
}

interface PositionedItem {
  text: string
  x: number
  y: number
  width: number
  height: number
}

function medianOf(values: number[]): number {
  const sorted = values.filter((v) => v > 0).sort((a, b) => a - b)
  if (sorted.length === 0) return 10
  return sorted[Math.floor(sorted.length / 2)]
}

/**
 * Find a vertical band that no text crosses and that has a meaningful amount of
 * content on either side - i.e. the gutter between two columns. Returns the x to
 * split at, or null when the block is a single column.
 */
function findColumnGutter(items: PositionedItem[]): number | null {
  if (items.length < 12) return null

  const minX = Math.min(...items.map((i) => i.x))
  const maxX = Math.max(...items.map((i) => i.x + i.width))
  const pageWidth = maxX - minX
  if (pageWidth <= 0) return null

  const BINS = 100
  const binWidth = pageWidth / BINS
  const occupied = new Array(BINS).fill(false)

  for (const item of items) {
    const from = Math.max(0, Math.floor((item.x - minX) / binWidth))
    const to = Math.min(BINS - 1, Math.ceil((item.x + item.width - minX) / binWidth))
    for (let b = from; b <= to; b++) occupied[b] = true
  }

  // widest empty run that is not touching either edge
  let best: { start: number; end: number } | null = null
  let runStart: number | null = null
  for (let b = 0; b < BINS; b++) {
    if (!occupied[b]) {
      if (runStart === null) runStart = b
    } else if (runStart !== null) {
      if (runStart > 0 && (!best || b - runStart > best.end - best.start)) {
        best = { start: runStart, end: b }
      }
      runStart = null
    }
  }

  if (!best) return null
  // A real gutter is a decent slice of the page, not the gap between two words.
  if ((best.end - best.start) / BINS < 0.04) return null

  const splitX = minX + ((best.start + best.end) / 2) * binWidth
  const left = items.filter((i) => i.x + i.width / 2 < splitX).length
  const right = items.length - left

  // Both sides need real content, otherwise this is just an indent.
  const share = Math.min(left, right) / items.length
  if (share < 0.15) return null

  return splitX
}

/**
 * Group text fragments into lines by vertical position, then order each line
 * left to right.
 */
function blockToLines(items: PositionedItem[]): string[] {
  if (items.length === 0) return []

  const medianHeight = medianOf(items.map((i) => i.height))
  const tolerance = Math.max(2, medianHeight * 0.5)

  const rows: PositionedItem[][] = []
  for (const item of [...items].sort((a, b) => b.y - a.y)) {
    const row = rows[rows.length - 1]
    if (row && Math.abs(row[0].y - item.y) <= tolerance) {
      row.push(item)
    } else {
      rows.push([item])
    }
  }

  return rows
    .map((row) => {
      const sorted = [...row].sort((a, b) => a.x - b.x)
      let line = ""
      let previousEnd: number | null = null
      for (const item of sorted) {
        if (previousEnd !== null) {
          const gap = item.x - previousEnd
          if (gap > medianHeight * 1.5) {
            // A wide gap is a column break inside the line - "Job title" on the
            // left, "2021 - 2023" pushed to the right. Keep it as a tab so the
            // parser can tell this apart from "Company | 2021 - 2023".
            line += "\t"
          } else if (gap > medianHeight * 0.2 && !line.endsWith(" ") && !item.text.startsWith(" ")) {
            // pdf.js often splits a word across items; only add a space where
            // there is a real gap between this fragment and the previous one.
            line += " "
          }
        }
        line += item.text
        previousEnd = item.x + item.width
      }
      return line.replace(/ {2,}/g, " ").replace(/\t+/g, "\t").trim()
    })
    .filter((line) => line !== "")
}

/** Split into columns where a gutter exists, then read each column in order. */
function pageToLines(items: PositionedItem[], depth = 0): string[] {
  const splitX = depth < 2 ? findColumnGutter(items) : null
  if (splitX === null) return blockToLines(items)

  const left = items.filter((i) => i.x + i.width / 2 < splitX)
  const right = items.filter((i) => i.x + i.width / 2 >= splitX)
  // Blank line between columns so the parser can tell where a column starts -
  // that is where a name/role block usually sits in sidebar layouts.
  return [...pageToLines(left, depth + 1), "", ...pageToLines(right, depth + 1)]
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  // The legacy build runs in Node without a web worker.
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs")

  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    // No worker, no font fetching, no eval - we only want the text layer.
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: false,
    disableFontFace: true,
  }).promise

  try {
    const pages: string[] = []
    const pageCount = Math.min(doc.numPages, 15) // a CV is never longer than this

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const page = await doc.getPage(pageNumber)
      const content = await page.getTextContent()

      const items: PositionedItem[] = content.items
        .filter((item: any) => typeof item.str === "string" && item.str.trim() !== "")
        .map((item: any) => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: typeof item.width === "number" ? item.width : 0,
          height:
            typeof item.height === "number" && item.height > 0
              ? item.height
              : Math.abs(item.transform[3]) || 10,
        }))

      pages.push(pageToLines(items).join("\n"))
      page.cleanup()
    }

    return pages.join("\n\n")
  } finally {
    await doc.destroy()
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth: any = await import("mammoth")
  const result = await mammoth.extractRawText({ buffer })
  return String(result?.value || "")
}

export async function extractCvText(buffer: Buffer, format: SupportedCvFormat): Promise<string> {
  const raw = format === "pdf" ? await extractPdfText(buffer) : await extractDocxText(buffer)

  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ") // non-breaking spaces confuse the line rules
    .replace(/ {2,}/g, " ")
    .replace(/	+/g, "	") // tabs mark in-line column breaks - keep exactly one
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
