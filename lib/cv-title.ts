/**
 * Helpers for keeping CV titles usable when the database still enforces a
 * unique (user_id, title) index. See
 * supabase/migrations/20260911000000_drop_cvs_user_title_unique.sql
 */

export const UNIQUE_VIOLATION = "23505"

/** True for a Postgres unique-violation that names the title index. */
export const isTitleConflict = (error: any): boolean =>
  error?.code === UNIQUE_VIOLATION && String(error?.message || "").includes("title")

/**
 * Produce the next candidate title.
 *   nextTitle("cv.pdf", 2)      -> "cv (2).pdf"
 *   nextTitle("cv (2).pdf", 3)  -> "cv (3).pdf"
 *   nextTitle("Mitt CV", 2)     -> "Mitt CV (2)"
 */
export function nextTitle(title: string, attempt: number): string {
  const match = title.match(/^(.*?)(\.[A-Za-z0-9]{1,5})?$/)
  const stem = (match?.[1] || title).replace(/\s*\(\d+\)$/, "").trimEnd()
  const extension = match?.[2] || ""
  return `${stem} (${attempt})${extension}`
}
