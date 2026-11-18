import Link from "next/link"
import { formatJobCount } from "@/lib/jobs/format"

export type LandingCountRow = {
  /** Taxonomy concept id; only used as the React key. */
  id: string
  label: string
  count: number
  /**
   * Set only when the link opens a search with the same filter the count came
   * from, so the number here and the number on that page agree.
   */
  href?: string
}

/** "Stockholm  116 lediga jobb": places for a profession, or occupation fields for a place. */
export function LandingCountList({ rows }: { rows: LandingCountRow[] }) {
  if (rows.length === 0) return null
  return (
    <ul className="grid gap-x-8 sm:grid-cols-2">
      {rows.map((row) => (
        <li key={row.id} className="flex items-baseline justify-between gap-4 border-b border-ink-100 py-2.5">
          {row.href ? (
            <Link
              href={row.href}
              prefetch={false}
              className="min-w-0 font-medium text-brand-700 underline-offset-4 hover:underline"
            >
              {row.label}
            </Link>
          ) : (
            <span className="min-w-0 text-ink">{row.label}</span>
          )}
          <span className="shrink-0 text-sm text-ink-600">{formatJobCount(row.count)}</span>
        </li>
      ))}
    </ul>
  )
}
