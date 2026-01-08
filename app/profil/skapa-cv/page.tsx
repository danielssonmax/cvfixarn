import type { Metadata } from "next"
import { Suspense } from "react"
import CVMallClient from "./CVMallClient"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Skapa ditt CV | CVfixaren.se",
  description: "Använd vår CV-mall för att skapa ett professionellt CV som sticker ut. Enkelt, snabbt och effektivt.",
}

function CVMallClientSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CVMallPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Suspense fallback={<CVMallClientSkeleton />}>
          <CVMallClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
