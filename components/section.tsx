import { ReactNode } from "react"

interface SectionProps {
  children: ReactNode
  className?: string
  background?: "white" | "gray" | "gray-50" | "gray-100"
  id?: string
}

export function Section({ children, className = "", background = "white", id }: SectionProps) {
  // One cool-gray family for every tinted section, so alternating sections
  // read as rhythm rather than as different products stitched together.
  const backgroundClasses = {
    white: "bg-white",
    gray: "bg-ink-50",
    "gray-50": "bg-ink-50/60",
    "gray-100": "bg-ink-50",
  }

  return (
    <section id={id} className={`py-20 md:py-24 ${backgroundClasses[background]} ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}
