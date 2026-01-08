"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageIcon, Plus, Trash2, MoreVertical } from "lucide-react"
import Image from "next/image"
import { v4 as uuidv4 } from "uuid"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type OptionalField = {
  id: string
  type:
    | "birthDate"
    | "birthPlace"
    | "drivingLicense"
    | "gender"
    | "nationality"
    | "civilStatus"
    | "website"
    | "linkedin"
    | "custom"
  label: string
  value: string
}

type CustomFieldData = {
  label: string
  value: string
}

const PersonalInfo: React.FC = () => {
  const { register, watch, setValue, getValues } = useFormContext()
  const [optionalFields, setOptionalFields] = useState<Record<string, string>>({})
  const [availableOptionalFields, setAvailableOptionalFields] = useState<OptionalField["type"][]>([
    "birthDate",
    "birthPlace",
    "drivingLicense",
    "gender",
    "nationality",
    "civilStatus",
    "website",
    "linkedin",
  ])

  const formData = watch()

  // Initialize form with default values if they don't exist
  useEffect(() => {
    const currentValues = getValues()
    if (!currentValues.personalInfo) {
      setValue("personalInfo", {
        firstName: "",
        lastName: "",
        title: "",
        email: "",
        phone: "",
        address: "",
        postalCode: "",
        location: "",
        photo: "",
        summary: "",
        optionalFields: {}
      })
    }
  }, [getValues, setValue])

  // Handle initial load of optional fields
  useEffect(() => {
    const currentValues = getValues()
    const existingFields = currentValues.personalInfo?.optionalFields || {}
    
    if (Object.keys(existingFields).length > 0 && Object.keys(optionalFields).length === 0) {
      setOptionalFields(existingFields)
      setAvailableOptionalFields(
        availableOptionalFields.filter((field) => !(field in existingFields))
      )
    }
  }, [getValues])

  // Handle updates to optional fields
  useEffect(() => {
    const subscription = watch((value) => {
      const fields = value.personalInfo?.optionalFields || {}
      
      if (JSON.stringify(fields) !== JSON.stringify(optionalFields)) {
        setOptionalFields(fields)
        
        // Update available fields - exclude custom fields and label fields
        const baseAvailableFields: OptionalField["type"][] = [
          "birthDate",
          "birthPlace",
          "drivingLicense",
          "gender",
          "nationality",
          "civilStatus",
          "website",
          "linkedin",
        ]
        
        const usedFields = Object.keys(fields).filter(key => 
          !key.startsWith('custom_') && !key.endsWith('_label')
        )
        
        setAvailableOptionalFields(
          baseAvailableFields.filter((field) => !usedFields.includes(field))
        )
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, optionalFields])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setValue("personalInfo.photo", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addOptionalField = (type: OptionalField["type"]) => {
    // Prevent adding if already processing
    if (type !== "custom" && !availableOptionalFields.includes(type)) {
      console.log('Field already added, skipping:', type)
      return
    }
    
    let fieldKey = type
    // For custom fields, generate a unique key
    if (type === "custom") {
      fieldKey = `custom_${uuidv4()}`
    }
    const updatedFields = { ...optionalFields, [fieldKey]: "" }
    setOptionalFields(updatedFields)
    if (type !== "custom") {
      setAvailableOptionalFields(availableOptionalFields.filter((field) => field !== type))
    }
    setValue(`personalInfo.optionalFields`, updatedFields)
  }

  const getFieldLabel = (type: OptionalField["type"]): string => {
    const labels: Record<OptionalField["type"], string> = {
      birthDate: "Födelsedatum",
      birthPlace: "Födelseort",
      drivingLicense: "Körkort",
      gender: "Kön",
      nationality: "Nationalitet",
      civilStatus: "Civilstånd",
      website: "Webbplats",
      linkedin: "LinkedIn",
      custom: "Anpassat fält",
    }
    return labels[type]
  }

  const removeOptionalField = (type: string) => {
    const { [type]: removed, ...remainingFields } = optionalFields
    setOptionalFields(remainingFields)
    if (type !== "custom") {
      setAvailableOptionalFields([...availableOptionalFields, type as OptionalField["type"]])
    }
    setValue(`personalInfo.optionalFields`, remainingFields)
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2">
        <div className="grid grid-cols-[140px_1fr_1fr] gap-2">
            <div className="row-span-2">
              <Label className="block mb-2 text-sm font-normal text-gray-700">Foto</Label>
            <div
              className="w-[120px] h-[120px] bg-gray-100 rounded-md flex items-center justify-center border-2 border-transparent cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              {formData.personalInfo.photo ? (
                <Image
                  src={formData.personalInfo.photo || "/placeholder.svg"}
                  alt="Profilbild"
                  width={120}
                  height={120}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="photo-upload" />
            </div>
          </div>
          <div>
            <Label className="block mb-2 text-sm font-normal text-gray-700" htmlFor="firstName">
              Förnamn
            </Label>
            <Input {...register("personalInfo.firstName")} id="firstName" className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-12 text-sm rounded-md transition-colors" />
          </div>
          <div>
            <Label className="block mb-2 text-sm font-normal text-gray-700" htmlFor="lastName">
              Efternamn
            </Label>
            <Input {...register("personalInfo.lastName")} id="lastName" className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-12 text-sm rounded-md transition-colors" />
          </div>
          <div className="col-span-2">
            <Label className="block mb-2 text-sm font-normal text-gray-700" htmlFor="title">
              Önskad tjänst
            </Label>
            <Input {...register("personalInfo.title")} id="title" className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-12 text-sm rounded-md transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="block mb-2 text-sm font-normal text-gray-700" htmlFor="email">
              E-postadress
            </Label>
            <Input {...register("personalInfo.email")} id="email" type="email" className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-12 text-sm rounded-md transition-colors" />
          </div>
          <div>
            <Label className="block mb-2 text-sm font-normal text-gray-700" htmlFor="phone">
              Telefonnummer
            </Label>
            <Input {...register("personalInfo.phone")} id="phone" type="tel" className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-12 text-sm rounded-md transition-colors" />
          </div>
        </div>

        <div>
          <Label className="block mb-2 text-sm font-normal text-gray-700" htmlFor="address">
            Adress
          </Label>
          <Input {...register("personalInfo.address")} id="address" className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-12 text-sm rounded-md transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="block mb-2 text-sm font-normal text-gray-700" htmlFor="postalCode">
              Postnummer
            </Label>
            <Input {...register("personalInfo.postalCode")} id="postalCode" className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-12 text-sm rounded-md transition-colors" />
          </div>
          <div>
            <Label className="block mb-2 text-sm font-normal text-gray-700" htmlFor="city">
              Ort
            </Label>
            <Input {...register("personalInfo.location")} id="city" className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-12 text-sm rounded-md transition-colors" />
          </div>
        </div>

        {/* Optional fields */}
        {Object.entries(optionalFields).map(([fieldKey, value]) => {
          const isCustomField = fieldKey.startsWith('custom_')
          const fieldType = isCustomField ? 'custom' : fieldKey
          
          return (
            <div key={fieldKey}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-normal text-gray-700">
                  {isCustomField ? (
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onKeyDown={(e) => {
                        // Prevent line breaks on Enter
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          e.currentTarget.blur() // Blur the field to save
                        }
                      }}
                      // onBlur={(e) => {
                      //   const newLabel = e.currentTarget.textContent?.trim() || "Anpassat fält"
                      //   // Store the label in a special key
                      //   setValue(`personalInfo.optionalFields.${fieldKey}_label`, newLabel)
                      //   // Remove border on blur
                      //   e.currentTarget.style.borderBottomColor = 'transparent'
                      // }}
                      style={{
                        background: 'transparent',
                        outline: 'none',
                        display: 'inline-block',
                        borderBottom: '1px solid transparent',
                        transition: 'border-color 0.2s',
                        cursor: 'text',
                        paddingLeft: '4px',
                        paddingRight: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = '#00bf63'}
                      onMouseLeave={(e) => {
                        // Only hide border if not focused
                        if (document.activeElement !== e.currentTarget) {
                          e.currentTarget.style.borderBottomColor = 'transparent'
                        }
                      }}
                      onFocus={(e) => e.currentTarget.style.borderBottomColor = '#00bf63'}
                    >
                      Anpassat fält
                    </span>
                  ) : (
                    getFieldLabel(fieldType as OptionalField["type"])
                  )}
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => removeOptionalField(fieldKey)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Ta bort
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  {...register(`personalInfo.optionalFields.${fieldKey}`)}
                  defaultValue={value}
                  className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-12 text-sm rounded-md transition-colors flex-grow"
                />
              </div>
            </div>
          )
        })}

        <div className="flex flex-wrap gap-1">
          {availableOptionalFields.map((field) => (
            <Button key={field} type="button" variant="outline" className="h-8 px-2 text-xs" onClick={() => addOptionalField(field)}>
              <Plus className="h-3 w-3 mr-1" /> {getFieldLabel(field)}
            </Button>
          ))}
          <Button type="button" variant="outline" className="h-8 px-2 text-xs" onClick={() => addOptionalField("custom")}>
            <Plus className="h-3 w-3 mr-1" /> Anpassat fält
          </Button>
        </div>
      </div>
    </div>
  )
}

export { PersonalInfo }
