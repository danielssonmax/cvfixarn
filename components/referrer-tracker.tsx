"use client"

import { useEffect } from "react"
import { captureReferrer, captureGclidsFromUrl } from "@/lib/gclid-utils"

export function ReferrerTracker() {
  useEffect(() => {
    captureGclidsFromUrl()
    captureReferrer()
  }, [])

  return null
}
