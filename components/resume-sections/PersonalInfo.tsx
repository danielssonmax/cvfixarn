"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageIcon, Plus, Trash2, MoreVertical, ChevronDown } from "lucide-react"
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
    | "other"
    | "custom"
  label: string
  value: string
}

type CustomFieldData = {
  label: string
  value: string
}

// Order the optional fields are offered in, most commonly used first
const BASE_OPTIONAL_FIELDS: OptionalField["type"][] = [
  "linkedin",
  "website",
  "drivingLicense",
  "birthDate",
  "nationality",
  "birthPlace",
  "civilStatus",
  "gender",
  "other",
]

const PersonalInfo: React.FC = () => {
  const { register, watch, setValue, getValues } = useFormContext()
  const [optionalFields, setOptionalFields] = useState<Record<string, string>>({})
  const [availableOptionalFields, setAvailableOptionalFields] = useState<OptionalField["type"][]>([
    ...BASE_OPTIONAL_FIELDS,
  ])

  const [showMoreFieldsMenu, setShowMoreFieldsMenu] = useState(false)
  const moreFieldsRef = useRef<HTMLDivElement>(null)

  const formData = watch()

  // Close the "Fler fält" dropdown on an outside click
  useEffect(() => {
    if (!showMoreFieldsMenu) return
    const handleClickOutside = (event: MouseEvent) => {
      if (moreFieldsRef.current && !moreFieldsRef.current.contains(event.target as Node)) {
        setShowMoreFieldsMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showMoreFieldsMenu])

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
        BASE_OPTIONAL_FIELDS.filter((field) => !(field in existingFields))
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
        const baseAvailableFields: OptionalField["type"][] = [...BASE_OPTIONAL_FIELDS]
        
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
    
    let fieldKey: string = type
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
      website: "Webbsida",
      linkedin: "LinkedIn profil",
      other: "Övrigt",
      custom: "Fritext",
    }
    return labels[type]
  }

  const removeOptionalField = (type: string) => {
    const { [type]: removed, [`${type}_label`]: removedLabel, ...remainingFields } = optionalFields
    setOptionalFields(remainingFields)
    if (!type.startsWith("custom_")) {
      const next = [...availableOptionalFields, type as OptionalField["type"]]
      setAvailableOptionalFields(BASE_OPTIONAL_FIELDS.filter((field) => next.includes(field)))
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
              Roll
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
          // Label keys are stored alongside their field - they are not rows of their own
          if (fieldKey.endsWith('_label')) return null

          const isCustomField = fieldKey.startsWith('custom_')
          const fieldType = isCustomField ? 'custom' : fieldKey
          const customLabel = optionalFields[`${fieldKey}_label`] || "Fritext"

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
                      onBlur={(e) => {
                        const newLabel = e.currentTarget.textContent?.trim() || "Fritext"
                        e.currentTarget.textContent = newLabel
                        // Store the label alongside the value
                        const updatedFields = { ...optionalFields, [`${fieldKey}_label`]: newLabel }
                        setOptionalFields(updatedFields)
                        setValue(`personalInfo.optionalFields`, updatedFields)
                        // Remove border on blur
                        e.currentTarget.style.borderBottomColor = 'transparent'
                      }}
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
                      {customLabel}
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

        {/* Extra fields, collapsed behind a single button */}
        <div className="relative pt-2" ref={moreFieldsRef}>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-dashed border-gray-300 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation()
              setShowMoreFieldsMenu(!showMoreFieldsMenu)
            }}
          >
            <Plus className="h-4 w-4 text-[#00bf63]" />
            <span>Fler fält</span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showMoreFieldsMenu ? "rotate-180" : ""}`} />
          </button>

          {showMoreFieldsMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-50 max-h-72 overflow-y-auto">
              {availableOptionalFields.map((field) => (
                <button
                  key={field}
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors text-left"
                  onClick={(e) => {
                    e.stopPropagation()
                    addOptionalField(field)
                    setShowMoreFieldsMenu(false)
                  }}
                >
                  <Plus className="h-4 w-4 text-[#00bf63] shrink-0" />
                  <span className="text-sm text-gray-800">{getFieldLabel(field)}</span>
                </button>
              ))}
              {/* Fritext stays available - a CV can carry several free-text rows */}
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  addOptionalField("custom")
                  setShowMoreFieldsMenu(false)
                }}
              >
                <Plus className="h-4 w-4 text-[#00bf63] shrink-0" />
                <span className="text-sm text-gray-800">Fritext</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { PersonalInfo }
