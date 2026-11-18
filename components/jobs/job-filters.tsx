import Link from "next/link"
import { Button } from "@/components/ui/button"
import { JOBS_BASE_PATH, JOBS_PARAMS } from "@/lib/jobs/format"
import type { JobsSearchQuery } from "@/lib/jobs/format"

/**
 * The search form on /lediga-jobb. A plain GET form, so it works without
 * JavaScript and every search is a URL.
 *
 * The place is sent as typed text in this field. The page resolves it to a
 * municipality or region and redirects to the ort/lan URL from
 * lib/jobs/format.ts, so this param never stays in a URL that has results for
 * a known place.
 */
export const JOBS_PLACE_PARAM = "plats"

const PLACE_LIST_ID = "lediga-jobb-platser"

const fieldClass =
  "h-11 w-full rounded-lg border border-ink-200 bg-white px-3 text-base text-ink placeholder:text-ink-400 focus-visible:border-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 md:text-sm"

type Props = {
  query: JobsSearchQuery
  /** What to show in the place field: the resolved name, or the text we could not resolve. */
  place: string
  /** Municipality and region names for the suggestion list. */
  places: string[]
}

export function JobFilters({ query, place, places }: Props) {
  const hasSearch = Boolean(
    query.q || place || query.utanErfarenhet || query.distans || query.omfattning
  )

  return (
    <form
      method="get"
      action={JOBS_BASE_PATH}
      role="search"
      aria-label="Sök lediga jobb"
      className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft sm:p-5"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label htmlFor="jobb-q" className="mb-1.5 block text-sm font-medium text-ink-700">
            Yrke eller sökord
          </label>
          <input
            id="jobb-q"
            type="search"
            name={JOBS_PARAMS.q}
            defaultValue={query.q || ""}
            maxLength={100}
            placeholder="Till exempel undersköterska"
            autoComplete="off"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="jobb-plats" className="mb-1.5 block text-sm font-medium text-ink-700">
            Kommun eller län
          </label>
          <input
            id="jobb-plats"
            type="text"
            name={JOBS_PLACE_PARAM}
            defaultValue={place}
            maxLength={80}
            list={PLACE_LIST_ID}
            placeholder="Till exempel Västerås"
            autoComplete="off"
            className={fieldClass}
          />
          <datalist id={PLACE_LIST_ID}>
            {places.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <Button type="submit" className="h-11 w-full px-6 md:w-auto">
          Sök jobb
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-700">
        <label className="flex cursor-pointer items-center gap-2 py-1">
          <input
            type="checkbox"
            name={JOBS_PARAMS.utanErfarenhet}
            value="1"
            defaultChecked={Boolean(query.utanErfarenhet)}
            className="h-4 w-4 accent-brand-700"
          />
          Utan krav på erfarenhet
        </label>
        <label className="flex cursor-pointer items-center gap-2 py-1">
          <input
            type="checkbox"
            name={JOBS_PARAMS.distans}
            value="1"
            defaultChecked={Boolean(query.distans)}
            className="h-4 w-4 accent-brand-700"
          />
          Distansarbete möjligt
        </label>
        <label className="flex items-center gap-2 py-1">
          Omfattning
          <select
            name={JOBS_PARAMS.omfattning}
            defaultValue={query.omfattning || ""}
            className="h-9 rounded-lg border border-ink-200 bg-white px-2 text-base text-ink focus-visible:border-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 md:text-sm"
          >
            <option value="">Heltid och deltid</option>
            <option value="heltid">Heltid</option>
            <option value="deltid">Deltid</option>
          </select>
        </label>
        {hasSearch && (
          <Link
            href={JOBS_BASE_PATH}
            prefetch={false}
            className="py-1 font-medium text-ink-500 underline-offset-4 hover:text-ink hover:underline"
          >
            Rensa sökningen
          </Link>
        )}
      </div>
    </form>
  )
}
