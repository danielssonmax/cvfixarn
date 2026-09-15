"use client"

import type { CvTheme } from "@/lib/cv-templates/themes"

/**
 * Miniature of a themed template for the "Välj en mall" menu.
 *
 * The five original templates each have a hand-written block of JSX in
 * resume-editor.tsx. Repeating that ten more times would be a lot of markup to
 * keep in step with the real CSS, so this renders one parameterised sketch
 * driven by the theme's accent colour and `previewKind` instead.
 *
 * It is a sketch, not a live render: the real thing is the preview pane.
 */
export function CvThemePreview({ theme }: { theme: CvTheme }) {
  const accent = theme.accent
  const kind = theme.previewKind

  // Section heading, drawn the way each family of themes treats it.
  const heading = (label: string) => {
    switch (kind) {
      case "bar":
        return theme.id === "affar" ? (
          <div
            className="inline-block px-1 py-[1px] text-[4px] font-bold uppercase tracking-wide text-white"
            style={{ background: accent }}
          >
            {label}
          </div>
        ) : (
          <div
            className="pl-1 text-[5px] font-bold uppercase tracking-wide text-gray-800"
            style={{ borderLeft: `2px solid ${accent}` }}
          >
            {label}
          </div>
        )
      case "pill":
        return (
          <div
            className="inline-block rounded-full px-1.5 py-[1px] text-[4px] font-bold uppercase tracking-wide"
            style={{ background: `${accent}1A`, color: accent }}
          >
            {label}
          </div>
        )
      case "overline":
        return (
          <div
            className="pt-0.5 text-[4px] font-semibold uppercase tracking-[0.12em]"
            style={{ borderTop: "1px solid #E5E7EB", color: accent }}
          >
            {label}
          </div>
        )
      case "mono":
        return (
          <div
            className="pb-[1px] font-mono text-[4px] font-bold uppercase"
            style={{ borderBottom: `1px dashed ${accent}55`, color: accent }}
          >
            // {label}
          </div>
        )
      case "portrait":
        return (
          <div className="flex items-center gap-1 text-[4px] font-bold uppercase tracking-wider text-gray-900">
            <span className="block h-[1.5px] w-2" style={{ background: accent }} />
            {label}
          </div>
        )
      case "centered":
        return (
          <div
            className="pb-[1px] font-serif text-[4px] font-bold uppercase tracking-[0.15em] text-gray-900"
            style={{ borderBottom: "1px solid #111827" }}
          >
            {label}
          </div>
        )
      case "card":
        return (
          <div
            className="pb-[1px] text-[4px] font-bold uppercase tracking-wide"
            style={{ borderBottom: `1.5px solid ${accent}55`, color: accent }}
          >
            {label}
          </div>
        )
      default:
        return (
          <div
            className="relative pb-[2px] text-[4px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: accent }}
          >
            {label}
            <span
              className="absolute bottom-0 left-0 block h-[1.5px] w-2"
              style={{ background: accent }}
            />
          </div>
        )
    }
  }

  const chip = (label: string) => {
    if (kind === "mono") {
      return (
        <span
          key={label}
          className="border px-[2px] font-mono text-[3px]"
          style={{ borderColor: `${accent}55`, color: accent }}
        >
          {label}
        </span>
      )
    }
    if (kind === "centered" || kind === "overline" || kind === "portrait") {
      return (
        <span key={label} className="text-[3.5px] text-gray-600">
          {label}
        </span>
      )
    }
    return (
      <span
        key={label}
        className="rounded-full px-[3px] py-[0.5px] text-[3px]"
        style={{ background: `${accent}1A`, color: accent }}
      >
        {label}
      </span>
    )
  }

  // Header block: the strongest visual differentiator between themes.
  const header = () => {
    const name = "Anna Andersson"
    const role = "Senior Projektledare"
    const contact = "anna@email.se • 070-123 45 67"

    if (kind === "centered") {
      return (
        <div
          className="pb-1 text-center"
          style={{ borderBottom: "2px double #111827" }}
        >
          <div className="font-serif text-[7px] tracking-[0.1em] text-gray-900">{name}</div>
          <div className="font-serif text-[4px] italic text-gray-600">{role}</div>
          <div className="text-[3.5px] text-gray-500">{contact}</div>
        </div>
      )
    }

    if (kind === "card" || kind === "pill") {
      return (
        <div
          className={kind === "pill" ? "rounded-lg p-1" : "p-1"}
          style={{
            background: `${accent}14`,
            borderLeft: kind === "card" ? `2px solid ${accent}` : undefined,
          }}
        >
          <div className="text-[7px] font-bold" style={{ color: accent }}>
            {name}
          </div>
          <div className="text-[4px] text-gray-600">{role}</div>
          <div className="text-[3.5px] text-gray-500">{contact}</div>
        </div>
      )
    }

    if (kind === "portrait") {
      return (
        <div
          className="flex items-center gap-1 pb-1"
          style={{ borderBottom: "1px solid #111827" }}
        >
          <div className="flex-1">
            <div className="text-[9px] font-bold leading-none tracking-tight text-gray-900">
              {name}
            </div>
            <div className="mt-[2px] text-[3.5px] uppercase tracking-[0.2em] text-gray-500">
              {role}
            </div>
          </div>
          <div
            className="h-4 w-4 flex-shrink-0 rounded-full border"
            style={{ borderColor: accent }}
          />
        </div>
      )
    }

    if (kind === "overline") {
      return (
        <div>
          <div className="text-[8px] font-extralight uppercase tracking-[0.25em] leading-tight text-gray-900">
            {name}
          </div>
          <div
            className="mt-[2px] text-[3.5px] uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {role}
          </div>
          <div className="mt-[2px] text-[3.5px] text-gray-500">{contact}</div>
        </div>
      )
    }

    if (kind === "bar" && theme.id === "affar") {
      return (
        <div className="pl-1" style={{ borderLeft: `2.5px solid ${accent}` }}>
          <div className="text-[7px] font-bold" style={{ color: accent }}>
            {name}
          </div>
          <div className="text-[3.5px] font-semibold uppercase tracking-wider text-gray-700">
            {role}
          </div>
          <div className="text-[3.5px] text-gray-500">{contact}</div>
        </div>
      )
    }

    if (kind === "bar") {
      return (
        <div>
          <div className="pb-[2px] text-[8px] font-bold tracking-tight text-gray-900">
            {name}
          </div>
          <div className="h-[2px] w-5 rounded-full" style={{ background: accent }} />
          <div className="mt-[2px] text-[4px] text-gray-600">{role}</div>
          <div className="text-[3.5px] text-gray-500">{contact}</div>
        </div>
      )
    }

    if (kind === "mono") {
      return (
        <div className="pb-1" style={{ borderBottom: `1.5px solid ${accent}` }}>
          <div className="text-[7px] font-bold tracking-tight text-gray-900">{name}</div>
          <div className="font-mono text-[3.5px]" style={{ color: accent }}>
            {role}
          </div>
          <div className="font-mono text-[3.5px] text-gray-500">{contact}</div>
        </div>
      )
    }

    // "rule" — Nordisk and Kompakt
    const tight = theme.id === "kompakt"
    return (
      <div
        className={tight ? "pb-[2px]" : "pb-1"}
        style={{ borderBottom: tight ? "1.5px solid #111827" : "1px solid #E5E7EB" }}
      >
        <div
          className={
            tight
              ? "text-[6px] font-bold tracking-tight text-gray-900"
              : "text-[8px] font-light tracking-wide text-gray-900"
          }
        >
          {name}
        </div>
        <div
          className="text-[3.5px] font-medium uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {role}
        </div>
        <div className="text-[3.5px] text-gray-500">{contact}</div>
      </div>
    )
  }

  const gap = theme.id === "kompakt" ? "space-y-[3px]" : "space-y-1"

  return (
    <div className={`${gap} text-[5px]`}>
      {header()}

      <div className="space-y-[2px]">
        {heading("Yrkeslivserfarenhet")}
        <div className="space-y-[2px] text-[4px]">
          <div>
            <div className="font-semibold text-gray-800">Projektledare</div>
            <div className="text-gray-500">Tech AB • 2020 - Nu</div>
          </div>
          <div>
            <div className="font-semibold text-gray-800">Utvecklare</div>
            <div className="text-gray-500">IT Consulting • 2018 - 2020</div>
          </div>
        </div>
      </div>

      <div className="space-y-[2px]">
        {heading("Utbildning")}
        <div className="text-[4px]">
          <div className="font-semibold text-gray-800">Civilingenjör</div>
          <div className="text-gray-500">KTH • 2014 - 2018</div>
        </div>
      </div>

      <div className="space-y-[2px]">
        {heading("Färdigheter")}
        <div className="flex flex-wrap items-center gap-[3px]">
          {["Agile", "Ledarskap", "SQL"].map(chip)}
        </div>
      </div>
    </div>
  )
}
