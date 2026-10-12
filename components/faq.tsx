import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Plus } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  items: FAQItem[]
}

export function FAQ({ items }: FAQProps) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-ink-100 border-y border-ink-100">
      {items.map((item, index) => (
        <Collapsible key={index} className="group">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-6 py-5 text-left">
            <h3 className="text-base font-semibold text-ink sm:text-lg">{item.question}</h3>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-[transform,background-color,color,border-color] duration-200 group-hover:border-ink-300 group-data-[state=open]:rotate-45 group-data-[state=open]:border-brand group-data-[state=open]:bg-brand group-data-[state=open]:text-white">
              <Plus className="h-4 w-4" />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <p className="max-w-[62ch] pb-6 pr-12 leading-relaxed text-ink-500">{item.answer}</p>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
