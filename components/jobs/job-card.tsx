import Link from "next/link"
import { formatJobDate } from "@/lib/jobs/format"
import type { JobAdSummary } from "@/lib/jobs/types"

/**
 * One ad in a list, linking to our own ad page. Render inside a <ul>
 * (see JobList). The headline is an h3, so the list needs an h2 above it.
 */
export function JobCard({ job }: { job: JobAdSummary }) {
  const place = job.municipality || job.region
  const facts = [job.employmentType, job.workingHours].filter(Boolean)
  const published = formatJobDate(job.publishedAt)
  const deadline = formatJobDate(job.deadline)

  return (
    <li>
      {/* No prefetch: a list holds 20 ads and each prefetch would be a server render plus an upstream call. */}
      <Link
        href={job.path}
        prefetch={false}
        className="group block rounded-xl border border-ink-100 bg-white p-4 transition-colors hover:border-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-5"
      >
        <h3 className="break-words text-base font-semibold text-ink group-hover:text-brand-800 sm:text-lg">
          {job.headline}
        </h3>
        {(job.employer || place) && (
          <p className="mt-1 text-sm text-ink-600">{[job.employer, place].filter(Boolean).join(" · ")}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-500">
          {facts.length > 0 && <span>{facts.join(", ")}</span>}
          {published && (
            <span>
              Publicerad <time dateTime={job.publishedAt!.slice(0, 10)}>{published}</time>
            </span>
          )}
          {deadline && (
            <span>
              Sök senast <time dateTime={job.deadline!.slice(0, 10)}>{deadline}</time>
            </span>
          )}
        </div>
      </Link>
    </li>
  )
}
