import type { MetadataRoute } from "next"
import { cvExamples } from "@/lib/cv-examples"
import { COVER_LETTERS_UPDATED, coverLetterExamples } from "@/lib/cover-letter-examples"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.cvfixaren.se"

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/profil/skapa-cv`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cv-mallar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/skriva-cv`,
      lastModified: new Date("2026-10-12"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ats-anpassade-cv-mallar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cv-exempel`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // One entry per profession page, straight from the data so new batches are included.
    ...Object.keys(cvExamples).map((slug) => ({
      url: `${baseUrl}/cv-exempel/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${baseUrl}/exempel-personliga-brev`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...coverLetterExamples.map((example) => ({
      url: `${baseUrl}/exempel-personliga-brev/${example.slug}`,
      lastModified: new Date(COVER_LETTERS_UPDATED),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${baseUrl}/blogg`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogg/vi-analyserade-cv`,
      lastModified: new Date("2026-11-03"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/vad-vill-rekryterare-se-i-ett-cv`,
      lastModified: new Date("2026-11-03"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/kompetenser-i-cv`,
      lastModified: new Date("2026-11-03"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/med-vanliga-halsningar`,
      lastModified: new Date("2026-11-03"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/personligt-brev-pa-engelska`,
      lastModified: new Date("2026-11-03"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/skriva-cv-med-ai`,
      lastModified: new Date("2026-11-03"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/soka-jobb-annan-stad`,
      lastModified: new Date("2026-03-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/personligt-brev-utan-erfarenhet`,
      lastModified: new Date("2026-02-10"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/varfor-vill-du-jobba-har`,
      lastModified: new Date("2026-02-10"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/presentera-dig-sjalv`,
      lastModified: new Date("2026-02-10"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/styrkor-och-svagheter-jobbintervjun`,
      lastModified: new Date("2026-02-10"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/rekryterarens-5-ovantade-cv-tips`,
      lastModified: new Date("2025-01-28"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/sa-skriver-du-ett-cv-som-sticker-ut`,
      lastModified: new Date("2024-02-14"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/5-vanliga-misstag-att-undvika`,
      lastModified: new Date("2024-02-10"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/personligt-brev-guide`,
      lastModified: new Date("2026-11-03"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/linkedin-profil-optimering`,
      lastModified: new Date("2024-02-03"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/arbetsintervju-fragor-och-svar`,
      lastModified: new Date("2024-01-28"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogg/ai-och-framtidens-cv`,
      lastModified: new Date("2024-01-25"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/karriartips`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/intervjuguide`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/vanliga-fragor`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/anvandarvillkor`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/marknadsforing`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}
