"use client"

import { useEffect } from "react"
import { captureReferrer } from "@/lib/gclid-utils"

export function ReferrerTracker() {
  useEffect(() => {
    captureReferrer()
  }, [])

  return null
}
