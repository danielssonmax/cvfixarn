import type { Metadata } from "next"
import { Suspense } from "react"
import FortsattClient from "./FortsattClient"

export const metadata: Metadata = {
  title: "Fortsätt på ditt CV | CVfixaren.se",
  robots: { index: false, follow: false },
}

export default function FortsattPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#00bf63]" />
        </div>
      }
    >
      <FortsattClient />
    </Suspense>
  )
}
