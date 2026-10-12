"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import StripeCheckoutDialog from "./stripe-checkout-dialog"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface CapturePaymentProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
}

export default function CapturePayment({ isOpen, onClose, onPaymentSuccess }: CapturePaymentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handlePaymentClick = () => {
    setIsDialogOpen(true)
  }

  const handlePaymentSuccess = () => {
    onPaymentSuccess()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] p-0 gap-0 border-0 bg-white">
        <DialogTitle className="sr-only">Starta din gratisvecka på CVfixaren</DialogTitle>

        <div className="p-6 pt-7 sm:p-7">
          {/* Header */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
            Steg 2 av 2 · Bekräfta medlemskap
          </p>
          <h1 className="mt-2 pr-8 text-[1.6rem] font-bold leading-tight tracking-tight text-ink">
            Starta din gratisvecka på CVfixaren
          </h1>

          {/* Membership Card */}
          <div className="mt-6 rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-ink">Premium</h3>
              <span className="rounded-md bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                7 dagar gratis
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-ink tabular">0 kr</span>
              <span className="text-sm font-medium text-ink-500">för 7 dagar</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              Därefter 69 kr/vecka · ingen bindningstid
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              Ladda ner ditt CV som PDF och få tillgång till alla mallar och funktioner.
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handlePaymentClick}
            className="btn-sweep-glow mt-5 flex h-14 w-full items-center justify-center rounded-xl bg-brand text-lg font-semibold text-white shadow-[0_1px_2px_rgb(0_80_40/0.2),0_8px_20px_-6px_rgb(0_191_99/0.55)] hover:bg-brand-600 active:translate-y-px"
          >
            <span>Kom igång gratis</span>
          </button>

          {/* Skip link */}
          <p className="text-center mt-3">
            <button
              onClick={onClose}
              className="text-sm text-ink-400 underline underline-offset-2 hover:text-ink-600"
            >
              Fortsätt utan erbjudande
            </button>
          </p>

          {/* Payment icons */}
          <div className="mt-5 flex items-center justify-center gap-4 opacity-80">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
              alt="Mastercard"
              width={40}
              height={25}
              className="h-6 w-auto object-contain"
            />
            <Image
              src="https://1000logos.net/wp-content/uploads/2021/11/VISA-logo.png"
              alt="Visa"
              width={50}
              height={16}
              className="h-5 w-auto object-contain"
            />
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png"
              alt="Google Pay"
              width={50}
              height={20}
              className="h-5 w-auto object-contain"
            />
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/2560px-Apple_Pay_logo.svg.png"
              alt="Apple Pay"
              width={50}
              height={20}
              className="h-5 w-auto object-contain"
            />
          </div>

          {/* Feature list */}
          <ul className="mt-6 space-y-2.5 border-t border-ink-100 pt-5">
            {[
              "Ladda ner ditt CV som ATS-anpassad PDF",
              "Välj mellan flera professionella mallar",
              "Spara och redigera ditt CV när som helst",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <Check className="h-3 w-3 text-brand-700" strokeWidth={3} />
                </span>
                <span className="text-sm text-ink-600">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Fine print */}
          <p className="mt-5 text-xs leading-relaxed text-ink-400">
            Du får full tillgång till alla CV-mallar och funktioner i 7 dagar gratis. Därefter
            förnyas prenumerationen för 69 kr/vecka. Du kan avsluta när du vill via dina
            inställningar.
          </p>
        </div>
      </DialogContent>
      
      <StripeCheckoutDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Dialog>
  )
}

