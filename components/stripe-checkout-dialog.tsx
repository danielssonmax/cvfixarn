"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, AlertTriangle } from "lucide-react"
import React from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { useAuth } from "@/contexts/AuthContext"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface StripeCheckoutDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubscriptionSuccess?: () => void
  onPaymentSuccess?: () => void
}

export default function StripeCheckoutDialog({ isOpen, onClose, onSubscriptionSuccess, onPaymentSuccess }: StripeCheckoutDialogProps) {
  const [clientSecret, setClientSecret] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const { user } = useAuth()

  React.useEffect(() => {
    if (isOpen && user?.id) {
      if (!stripePromise) {
        setError("Stripe is not properly configured. Please try again later.")
        return
      }

      fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          priceId: "price_1SxjgoGE8ubumLAkT6ZRDsga",
          userId: user.id 
        }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => {
          console.error("Error creating checkout session:", err)
          setError("Failed to initialize payment. Please try again later.")
        })
    }
  }, [isOpen, user?.id])

  const handleSubscriptionSuccess = () => {
    onSubscriptionSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <DialogTitle>CVfixaren medlemskap</DialogTitle>
        </DialogHeader>
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 overflow-y-auto px-6 pb-6">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <p className="text-gray-600">{error}</p>
          </div>
        ) : clientSecret && stripePromise ? (
          <div className="flex-1 min-h-0 px-6 pb-6">
            <div className="h-[70vh] max-h-[500px] overflow-y-auto rounded-md border border-gray-200">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 px-6 pb-6">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
