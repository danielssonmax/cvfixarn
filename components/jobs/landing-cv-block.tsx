import Link from "next/link"
import { Button } from "@/components/ui/button"

const linkClass = "font-semibold text-brand-700 underline-offset-4 hover:underline"

type Props = {
  /** Lowercase profession ("undersköterska"). Leave out on a page that is not about one profession. */
  profession?: string
  /** Our CV example for the profession, when the site has one. */
  cvExampleHref?: string
  /** Our cover letter example for the profession, when the site has one. */
  coverLetterHref?: string
}

/**
 * What the site adds to a list of ads: the CV example and cover letter example
 * for the profession, and the way into the CV builder. Without a profession it
 * links to the two example hubs instead.
 */
export function LandingCvBlock({ profession, cvExampleHref, coverLetterHref }: Props) {
  const forProfession = Boolean(profession && (cvExampleHref || coverLetterHref))

  let text = "Se hur ett CV och ett personligt brev kan se ut för olika yrken, och skapa sedan ditt eget CV."
  if (forProfession) {
    if (cvExampleHref && coverLetterHref) {
      text = `Vi har ett CV-exempel och ett exempel på personligt brev för ${profession}. Använd dem som utgångspunkt och skapa sedan ditt eget CV.`
    } else if (cvExampleHref) {
      text = `Vi har ett CV-exempel för ${profession}. Använd det som utgångspunkt och skapa sedan ditt eget CV.`
    } else {
      text = `Vi har ett exempel på personligt brev för ${profession}. Använd det som utgångspunkt och skapa ditt CV till ansökan.`
    }
  }

  const links = forProfession
    ? [
        cvExampleHref ? { href: cvExampleHref, label: `CV-exempel för ${profession}` } : null,
        coverLetterHref ? { href: coverLetterHref, label: `Personligt brev som ${profession}` } : null,
      ]
    : [
        { href: "/cv-exempel", label: "CV-exempel för olika yrken" },
        { href: "/exempel-personliga-brev", label: "Exempel på personliga brev" },
      ]

  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-ink">Gör din ansökan klar</h2>
          <p className="mt-1 text-ink-600">{text}</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {links.map(
              (link) =>
                link && (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                )
            )}
          </ul>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href="/profil/skapa-cv">Skapa ditt CV</Link>
        </Button>
      </div>
    </div>
  )
}
