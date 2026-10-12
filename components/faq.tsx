import { Plus } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  items: FAQItem[]
}

// Native <details> keeps every answer in the server-rendered HTML, so search
// engines index the answers too. A JS accordion only mounts the open one.
export function FAQ({ items }: FAQProps) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-ink-100 border-y border-ink-100">
      {items.map((item, index) => (
        <details key={index} className="group">
          <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <h3 className="text-base font-semibold text-ink sm:text-lg">{item.question}</h3>
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-[transform,background-color,color,border-color] duration-200 group-hover:border-ink-300 group-open:rotate-45 group-open:border-brand group-open:bg-brand group-open:text-white"
            >
              <Plus className="h-4 w-4" />
            </span>
          </summary>
          <p className="max-w-[62ch] pb-6 pr-12 leading-relaxed text-ink-500 animate-fade-in">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
