import { JobCard } from "@/components/jobs/job-card"
import { JOBS_SOURCE_LABEL } from "@/lib/jobs/format"
import type { JobAdSummary } from "@/lib/jobs/types"

/** A list of ads with the source line under it. Renders nothing for an empty list. */
export function JobList({ jobs }: { jobs: JobAdSummary[] }) {
  if (jobs.length === 0) return null
  return (
    <>
      <ul className="space-y-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink-500">{JOBS_SOURCE_LABEL}</p>
    </>
  )
}
