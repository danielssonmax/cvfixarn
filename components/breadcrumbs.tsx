import Link from "next/link"
import { ChevronRight } from "lucide-react"
import Script from "next/script"

interface Breadcrumb {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: Breadcrumb[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaItems = [
    { "@type": "ListItem" as const, position: 1, name: "Hem", item: "https://www.cvfixaren.se" },
    ...items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 2,
      name: item.label,
      item: `https://www.cvfixaren.se${item.href}`,
    })),
  ]

  return (
    <>
      <Script
        id={`breadcrumb-schema-${items.map(i => i.href).join("-")}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: schemaItems,
          }),
        }}
      />
      <nav aria-label="Brödsmulor" className="text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="text-ink-400 hover:text-ink">
              Hem
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              <ChevronRight aria-hidden className="h-4 w-4 text-ink-300" />
              {index === items.length - 1 ? (
                <span aria-current="page" className="font-medium text-ink">{item.label}</span>
              ) : (
                <Link href={item.href} className="text-ink-400 hover:text-ink">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
