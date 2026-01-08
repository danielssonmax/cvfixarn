"use client"

import { useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import type { StripeError } from "@stripe/stripe-js"

interface EmbeddedCheckoutFormProps {
  onPaymentSuccess: () => void
}

export function EmbeddedCheckoutForm({ onPaymentSuccess }: EmbeddedCheckoutFormProps) {
  const [error, setError] = useState<StripeError | null>(null)

  return (
    <div className="w-full">
      {/* EmbeddedCheckoutProvider requires stripe promise and options */}
      <div className="min-h-[400px] w-full">
        <div className="text-center p-8">
          <p className="text-gray-600">Payment form will be displayed here.</p>
          <button 
            onClick={onPaymentSuccess}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Simulate Payment Success
          </button>
        </div>
      </div>
      {error && <div className="text-red-500 mt-4 text-sm">Ett fel uppstod: {error.message}</div>}
    </div>
  )
}
