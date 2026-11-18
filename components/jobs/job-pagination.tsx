import Link from "next/link"
import { buildJobsSearchHref } from "@/lib/jobs/format"
import type { JobsSearchQuery } from "@/lib/jobs/format"

const linkClass =
  "inline-flex h-10 items-center rounded-lg border border-ink-200 bg-white px-4 text-sm font-semibold text-ink hover:border-ink-300 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

/** Previous and next links for a search. Renders nothing when there is only one page. */
export function JobPagination({
  query,
  page,
  totalPages,
}: {
  query: JobsSearchQuery
  page: number
  totalPages: number
}) {
  if (totalPages <= 1) return null
  const hrefFor = (target: number) => buildJobsSearchHref({ ...query, sida: target })

  return (
    <nav aria-label="Sidor" className="mt-8 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" prefetch={false} className={linkClass}>
          Föregående
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-ink-500">
        Sida {page.toLocaleString("sv-SE")} av {totalPages.toLocaleString("sv-SE")}
      </p>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" prefetch={false} className={linkClass}>
          Nästa
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
