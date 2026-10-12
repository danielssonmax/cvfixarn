"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const columns = [
  {
    title: "CV-verktyg",
    links: [
      { href: "/profil/skapa-cv", label: "Skapa CV" },
      { href: "/cv-mallar", label: "CV-mallar" },
      { href: "/ats-anpassade-cv-mallar", label: "ATS-anpassade CV-mallar" },
      { href: "/cv-exempel", label: "CV-exempel" },
      { href: "/exempel-personliga-brev", label: "Personliga brev-exempel" },
    ],
  },
  {
    title: "Resurser",
    links: [
      { href: "/blogg", label: "Blogg" },
      { href: "/karriartips", label: "Karriärtips" },
      { href: "/intervjuguide", label: "Intervjuguide" },
      { href: "/vanliga-fragor", label: "Vanliga frågor" },
    ],
  },
  {
    title: "Företag",
    links: [
      { href: "/kontakt", label: "Kontakta oss" },
      { href: "/anvandarvillkor", label: "Användarvillkor" },
      { href: "/marknadsforing", label: "Marknadsföringspolicy" },
    ],
  },
]

export function Footer() {
  const pathname = usePathname()

  if (pathname === "/profil/skapa-cv") {
    return null
  }

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-12">
          <div className="col-span-2 md:col-span-5 md:pr-10">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cvfixaren%20vit%20text-C9N9dYDQWLbWkVnM1iLtDy1fBDGRi7.png"
              alt="CVfixaren.se"
              width={200}
              height={50}
              className="h-8 w-auto"
            />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-300">
              CVfixaren.se hjälper dig att skapa professionella CV:n som sticker ut från mängden.
            </p>
            <Link
              href="/profil/skapa-cv"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-200"
            >
              Skapa ditt CV nu
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="md:col-span-2 last:md:col-span-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-200 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} CVfixaren.se. Alla rättigheter förbehållna.</p>
          <div className="flex gap-5">
            <Link href="/anvandarvillkor" className="hover:text-white">
              Användarvillkor
            </Link>
            <Link href="/kontakt" className="hover:text-white">
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
