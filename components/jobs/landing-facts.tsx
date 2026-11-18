import Link from "next/link"

export type LandingFact = {
  /** What the number counts, e.g. "Utan krav på erfarenhet". */
  label: string
  count: number
  /** The /lediga-jobb view that lists exactly these ads, where one exists. */
  href?: string
}

/**
 * A few live counts for a landing page. Every number comes from the caller's
 * own API calls; a fact that could not be fetched is simply not passed in.
 */
export function LandingFacts({ facts }: { facts: LandingFact[] }) {
  if (facts.length === 0) return null
  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col-reverse rounded-xl border border-ink-100 bg-white px-4 py-3">
          <dt className="text-sm text-ink-600">
            {fact.href ? (
              <Link
                href={fact.href}
                prefetch={false}
                className="font-medium text-brand-700 underline-offset-4 hover:underline"
              >
                {fact.label}
              </Link>
            ) : (
              fact.label
            )}
          </dt>
          <dd className="text-2xl font-bold text-ink">{fact.count.toLocaleString("sv-SE")}</dd>
        </div>
      ))}
    </dl>
  )
}
