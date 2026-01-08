"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import StripeCheckoutDialog from "./stripe-checkout-dialog"
import { Dialog, DialogContent } from "@/components/ui/dialog"
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
      <DialogContent className="sm:max-w-[480px] p-0 border-0 overflow-hidden bg-white">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pt-8">
          {/* Header */}
          <h1 className="text-2xl font-semibold text-gray-900">
            Starta din gratisvecka på CVfixaren
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-2">
            STEG 2 AV 2 · BEKRÄFTA MEDLEMSKAP
          </p>

          {/* Membership Card */}
          <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">CVfixaren medlemskap</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ladda ner ditt CV som PDF och få tillgång<br />
                  till alla mallar och funktioner.
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-[#00bf63]">0 kr</span>
                <p className="text-xs text-gray-500 mt-1">
                  Därefter 89 kr/vecka ·<br />
                  ingen bindningstid
                </p>
              </div>
            </div>
            
            {/* Feature highlight */}
            <div className="mt-4 flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
              <div className="h-5 w-5 rounded bg-[#00bf63] flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-gray-700">Få tillgång till professionella CV-mallar</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handlePaymentClick}
            className="w-full mt-6 bg-[#00bf63] hover:bg-[#00a857] text-white font-semibold py-4 rounded-xl transition-colors text-lg"
          >
            Kom igång gratis
          </button>

          {/* Skip link */}
          <p className="text-center mt-3">
            <button 
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Fortsätt utan erbjudande
            </button>
          </p>

          {/* Payment icons */}
          <div className="flex justify-center items-center gap-3 mt-4">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/2560px-Mastercard-logo.svg.png"
              alt="Mastercard"
              width={40}
              height={25}
              className="h-6 w-auto object-contain"
            />
            <span className="text-gray-300 font-light">|</span>
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
              alt="Visa"
              width={50}
              height={16}
              className="h-5 w-auto object-contain"
            />
            <span className="text-gray-300 font-light">|</span>
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png"
              alt="Google Pay"
              width={50}
              height={20}
              className="h-5 w-auto object-contain"
            />
            <span className="text-gray-300 font-light">|</span>
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/2560px-Apple_Pay_logo.svg.png"
              alt="Apple Pay"
              width={50}
              height={20}
              className="h-5 w-auto object-contain"
            />
          </div>

          {/* Feature list */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600">Ladda ner ditt CV som PDF</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600">Välj mellan flera professionella mallar</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600">Spara och redigera ditt CV när som helst</span>
            </div>
          </div>

          {/* Fine print */}
          <p className="mt-6 text-xs text-gray-500 leading-relaxed">
            Du får full tillgång till alla CV-mallar och funktioner i 7 dagar gratis. Därefter 
            förnyas prenumerationen för 89 kr/vecka. Du kan avsluta när du vill via dina 
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

