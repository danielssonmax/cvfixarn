/**
 * The CV's file name is derived from what the user types into the editor:
 * Firstname_Lastname_CV_Role.pdf
 *
 * Beyond being a better default than "cv.pdf", it keeps a user's CVs from all
 * landing on the same title - which is what collided with the unique index on
 * (user_id, title) and made saves fail.
 */

/** Strip anything a file system rejects and collapse whitespace to underscores. */
function slug(value?: string): string {
  return String(value || "")
    .replace(/[\\/:*?"<>|#%&{}$!'@+`=]/g, "") // illegal or awkward in file names
    .replace(/\.+/g, "") // no stray dots, the extension is added separately
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[_-]+|[_-]+$/g, "")
    .trim()
}

export const DEFAULT_CV_FILENAME = "cv.pdf"

/**
 * buildCvFileName("Erik", "Johansson", "Systemutvecklare")
 *   -> "Erik_Johansson_CV_Systemutvecklare.pdf"
 * Falls back gracefully while the form is still half filled in:
 *   ("Erik", "", "")        -> "Erik_CV.pdf"
 *   ("", "", "Utvecklare")  -> "cv.pdf"   (a role alone is not identifying)
 */
export function buildCvFileName(firstName?: string, lastName?: string, role?: string): string {
  const parts = [slug(firstName), slug(lastName)].filter(Boolean)
  if (parts.length === 0) return DEFAULT_CV_FILENAME

  parts.push("CV")

  const roleSlug = slug(role)
  if (roleSlug) parts.push(roleSlug)

  // Keep it comfortably inside file-name limits on every platform.
  let name = parts.join("_")
  if (name.length > 120) name = name.slice(0, 120).replace(/_+$/, "")

  return `${name}.pdf`
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Was this title produced by us rather than chosen by the user? Used to decide
 * whether the name should keep following the form fields after a CV is loaded.
 * Accepts the " (2)" suffix the save endpoint adds when a title is taken.
 */
export function isDerivedCvName(title: string, derived: string): boolean {
  const value = (title || "").trim()
  if (!value || value === DEFAULT_CV_FILENAME) return true
  if (value === derived) return true

  const stem = escapeRegExp(derived.replace(/\.pdf$/i, ""))
  return new RegExp(`^${stem} \\(\\d+\\)\\.pdf$`, "i").test(value)
}
