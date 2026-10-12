"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Template ids → the rendered A4 preview in /public/images/templates. These are
 * real renders of each template (the same images the /cv-mallar page uses), so
 * what the user picks is what they get — unlike the old hand-drawn sketches.
 */
const PREVIEW_FILE: Record<string, string> = {
  default: "standard",
  modern: "modern",
  minimalist: "minimalistisk",
  executive: "executive",
  timeline: "timeline",
}

export function templatePreviewSrc(id: string) {
  return `/images/templates/cv-mall-${PREVIEW_FILE[id] ?? id}.png`
}

interface TemplateOption {
  id: string
  name: string
}

interface TemplatePickerProps {
  templates: TemplateOption[]
  selected: string
  onSelect: (id: string) => void
  /** `strip` scrolls sideways (mobile sheet), `grid` wraps (desktop popover). */
  layout?: "strip" | "grid"
  /** Colour scheme of the surface the picker sits on. */
  tone?: "light" | "dark"
  className?: string
}

export function TemplatePicker({
  templates,
  selected,
  onSelect,
  layout = "grid",
  tone = "light",
  className,
}: TemplatePickerProps) {
  const selectedRef = useRef<HTMLButtonElement>(null)

  // Bring the current template into view when the strip opens, so the user
  // sees where they are instead of always starting at the first template.
  useEffect(() => {
    if (layout !== "strip") return
    selectedRef.current?.scrollIntoView({ block: "nearest", inline: "center" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout])

  return (
    <div
      role="radiogroup"
      aria-label="Välj mall"
      className={cn(
        layout === "strip"
          ? "no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-1 pt-1"
          : "grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3",
        className,
      )}
    >
      {templates.map((template) => {
        const isSelected = template.id === selected
        return (
          <button
            key={template.id}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(template.id)
            }}
            className={cn(
              "group relative flex shrink-0 snap-start flex-col items-center gap-1.5 rounded-lg p-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              layout === "strip" ? "w-[86px]" : "w-full",
            )}
          >
            <span
              className={cn(
                "relative block aspect-[794/1123] w-full overflow-hidden rounded-[5px] bg-white transition-[box-shadow,transform] duration-200",
                isSelected
                  ? "shadow-lift ring-2 ring-brand ring-offset-2"
                  : "shadow-soft ring-1 ring-ink-200 group-hover:-translate-y-0.5 group-hover:ring-ink-300",
                tone === "dark" ? "ring-offset-ink" : "ring-offset-white",
              )}
            >
              <Image
                src={templatePreviewSrc(template.id)}
                alt=""
                fill
                sizes="120px"
                loading="lazy"
                className="object-cover object-top"
              />
              {isSelected && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand shadow-sm">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
              )}
            </span>
            <span
              className={cn(
                "w-full truncate text-xs",
                isSelected
                  ? "font-semibold " + (tone === "dark" ? "text-white" : "text-ink")
                  : "font-medium " + (tone === "dark" ? "text-ink-200" : "text-ink-500"),
              )}
            >
              {template.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
