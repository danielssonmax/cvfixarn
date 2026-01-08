"use client"

import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import RichTextEditor from "@/components/rich-text-editor"

export function Profile() {
  const { control, register } = useFormContext()

  return (
    <div className="space-y-3">
      <div>
        <Label className="block mb-2 text-sm font-normal text-gray-700">Beskrivning</Label>
        <RichTextEditor name={`sections.profile.description`} control={control} />
      </div>
    </div>
  )
}
