import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface CVTemplateCardProps {
  imageSrc: string
  alt: string
  templateName: string
  templateId: string
}

export function CVTemplateCard({ imageSrc, alt, templateName, templateId }: CVTemplateCardProps) {
  return (
    <Link
      href={`/profil/skapa-cv?template=${templateId}`}
      aria-label={`Använd ${templateName} CV-mall`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl bg-ink-50 px-8 pt-8 ring-1 ring-inset ring-ink-100 transition-colors group-hover:bg-brand-50">
        <div className="relative aspect-[3/4] w-full translate-y-3 overflow-hidden rounded-t-md shadow-page transition-transform duration-500 ease-out group-hover:translate-y-0">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-top"
            loading="lazy"
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-ink">{templateName}</h3>
          <p className="text-sm text-ink-500">ATS-anpassad · PDF</p>
        </div>
        <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgb(0_80_40/0.18)] transition-colors group-hover:bg-brand-600">
          Använd mall
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
