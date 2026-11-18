import Link from "next/link"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Section } from "@/components/section"
import { Button } from "@/components/ui/button"
import { JOBS_BASE_PATH } from "@/lib/jobs/format"

// Ads expire all the time, and links to them live on in the weekly job email
// and in search results, so this is a page people really land on.
export default function JobAdNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Section background="white">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-ink">Annonsen finns inte längre</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-600">
              Jobbet kan vara tillsatt eller så har ansökningstiden gått ut. Det kommer nya annonser varje dag.
            </p>
            <div className="mt-8">
              <Button asChild>
                <Link href={JOBS_BASE_PATH}>Visa lediga jobb</Link>
              </Button>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
