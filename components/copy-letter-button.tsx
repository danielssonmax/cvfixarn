"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

/** Copies an example letter as plain text, so it can be pasted into Word or an application form. */
export function CopyLetterButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard can be blocked (permissions, older browsers). Selecting the text is the fallback.
      const letter = document.getElementById("exempelbrev")
      if (letter) window.getSelection()?.selectAllChildren(letter)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_rgb(211_218_229)] transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-live="polite"
    >
      {copied ? <Check className="h-4 w-4 text-brand-700" /> : <Copy className="h-4 w-4" />}
      {copied ? "Kopierat" : "Kopiera brevet"}
    </button>
  )
}
