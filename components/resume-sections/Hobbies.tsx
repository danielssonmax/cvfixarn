"use client"

import { useState, useEffect, useRef } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, ChevronDown, MoreVertical, Check } from "lucide-react"
import RichTextEditor from "@/components/rich-text-editor"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Hobbies() {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections.hobbies",
  })
  const [openFields, setOpenFields] = useState<number[]>([])
  const hasInitialized = useRef(false)

  const handleAddNew = () => {
    const newIndex = fields.length
    append({
      title: "",
      description: "",
    })
    setOpenFields([newIndex])
  }

  useEffect(() => {
    if (!hasInitialized.current && fields.length === 0) {
      hasInitialized.current = true
      append({
        title: "",
        description: "",
      })
      setOpenFields([0])
    }
  }, [])

  const collapseField = (index: number) => {
    setOpenFields((prev) => prev.filter((i) => i !== index))
  }

  if (fields.length === 0) {
    return null
  }

  const renderField = (field: any, index: number) => {
    const isOpen = openFields.includes(index)
    return (
      <div key={field.id} className="mb-3">
        {!isOpen && (
          <div
            className="flex items-center justify-between w-full p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer rounded-md border border-gray-400"
            onClick={() => setOpenFields([index])}
          >
            <div className="flex flex-col gap-1 flex-grow">
              <span className="text-gray-900 text-sm font-medium">
                {field.title || "Ny fritidsaktivitet"}
              </span>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        )}

        {isOpen && (
          <div
            className="bg-white rounded-md p-6 space-y-5 relative border border-gray-400"
            style={{ paddingBottom: "60px" }}
          >
            <div>
              <Label className="block mb-2 text-sm font-normal text-gray-700">Rubrik</Label>
              <Input
                {...register(`sections.hobbies.${index}.title`)}
                className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors"
                placeholder=""
              />
            </div>

            <div>
              <Label className="block mb-2 text-sm font-normal text-gray-700">Beskrivning</Label>
              <RichTextEditor
                name={`sections.hobbies.${index}.description`}
                control={control}
                defaultValue={field.description}
              />
            </div>

            <div className="absolute right-6 bottom-3 flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 border-gray-300"
                onClick={(e) => {
                  e.stopPropagation()
                  remove(index)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-[#00bf63] hover:bg-[#00a857] text-white text-sm font-bold px-6 h-9 rounded-md flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  collapseField(index)
                }}
              >
                <Check className="h-4 w-4 stroke-[3]" />
                Klar
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => renderField(field, index))}
      
      <Button 
        onClick={handleAddNew} 
        variant="outline" 
        size="sm" 
        className="w-full text-sm font-normal px-4 h-11 mt-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
      >
        <Plus className="h-4 w-4 mr-2" />
        Lägg till fritidsaktivitet
      </Button>
    </div>
  )
}
