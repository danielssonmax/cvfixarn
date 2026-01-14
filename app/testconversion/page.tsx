"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function TestConversionPage() {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const downloadPDF = () => {
    console.log("Download PDF clicked - this is a test")
    alert("PDF download would be triggered here (test mode)")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Test Conversion Dialog</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to test the payment success dialog
        </p>
        <Button
          onClick={() => setShowSuccessDialog(true)}
          className="bg-[#00bf63] hover:bg-[#00a052] text-white font-semibold py-3 px-6 rounded-md"
        >
          Öppna Success Dialog
        </Button>

        {/* Payment Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent id="conversion" className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-green-600">
                🎉 Grattis!
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <p className="text-lg text-gray-800 mb-6">
                Du är ett steg närmare ditt nya jobb! Ladda ner ditt nya CV nu
              </p>
              <Button
                onClick={() => {
                  setShowSuccessDialog(false)
                  downloadPDF()
                }}
                className="w-full bg-[#00bf63] hover:bg-[#00a052] text-white font-semibold py-3 px-6 rounded-md"
              >
                Ladda ner CV
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSuccessDialog(false)}
                className="w-full mt-3"
              >
                Stäng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
