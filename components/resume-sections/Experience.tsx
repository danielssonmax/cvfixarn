"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit, Plus, ChevronDown, MoreVertical, GripVertical, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import RichTextEditor from "@/components/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const formatDate = (date: string, year: string) => {
  if (!date && !year) return ""
  const monthNames = [
    "Januari",
    "Februari",
    "Mars",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "Augusti",
    "September",
    "Oktober",
    "November",
    "December",
  ]
  const monthIndex = Number(date) - 1
  const monthName = monthNames[monthIndex] || ""
  return `${monthName} ${year || ""}`.trim()
}

// Sortable item component for drag and drop
function SortableExperienceItem({ 
  field, 
  index, 
  isOpen, 
  onToggle,
  onRemove,
  register,
  control,
  setValue
}: any) {
  const itemId = field.id
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Render page break item
  if (field.isPageBreak) {
    return (
      <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-30' : ''}>
        <div className="mb-3 flex items-center gap-3 py-4 min-h-[60px]">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none -ml-2">
            <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </div>
          <div className="flex-1 border-t-2 border-gray-300 -ml-1"></div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Sidbrytning</span>
          <div className="flex-1 border-t-2 border-gray-300"></div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
          </Button>
        </div>
      </div>
    )
  }

  const collapseField = () => {
    onToggle(index)
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
      <div className="mb-3 flex items-start gap-3">
        {/* Grip handle - always visible */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none pt-4 -ml-2">
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </div>
        
        {/* Content */}
        <div className="flex-1 -ml-1">
          {!isOpen && (
            <div
              className="flex items-center justify-between w-full p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer rounded-md border border-gray-400"
              onClick={() => onToggle(index)}
            >
              <div className="flex flex-col gap-1 flex-grow">
                <span className="text-gray-900 text-sm font-medium">
                  {field.title || field.company ? `${field.title}` : "Ny erfarenhet"}
                </span>
                {(field.company || field.startDate || field.startYear) && (
                  <p className="text-gray-500 text-xs">
                    {field.company}
                    {field.company && (field.startDate || field.startYear) && " • "}
                    {formatDate(field.startDate, field.startYear)}
                    {(field.startDate || field.startYear) && " - "}
                    {field.current ? "Nuvarande" : formatDate(field.endDate, field.endYear)}
                  </p>
                )}
              </div>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          )}

          {isOpen && (
            <div
              className="bg-white rounded-md p-6 space-y-5 relative border border-gray-400"
              style={{ paddingBottom: "56px" }}
            >
              {/* Titel */}
              <div>
                <Label className="block mb-2 text-sm font-normal text-gray-700">Tjänst</Label>
                <Input
                  {...register(`workExperience.${index}.title`)}
                  className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors"
                  placeholder=""
                />
              </div>

              {/* Arbetsgivare och Ort */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block mb-2 text-sm font-normal text-gray-700">Arbetsgivare</Label>
                  <Input
                    {...register(`workExperience.${index}.company`)}
                    className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors"
                    placeholder=""
                  />
                </div>
                <div>
                  <Label className="block mb-2 text-sm font-normal text-gray-700">Ort</Label>
                  <Input
                    {...register(`workExperience.${index}.location`)}
                    className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Datum med Nutid toggle */}
              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
                <div>
                  <Label className="block mb-2 text-sm font-normal text-gray-700">Startdatum</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      {...register(`workExperience.${index}.startDate`)}
                      className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors px-3 py-2 w-full"
                    >
                      <option value="">Månad</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = new Date(0, i).toLocaleString("sv-SE", { month: "long" })
                        return (
                          <option key={i} value={i + 1}>
                            {capitalizeFirstLetter(month)}
                          </option>
                        )
                      })}
                    </select>
                    <select
                      {...register(`workExperience.${index}.startYear`)}
                      className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors px-3 py-2 w-full"
                    >
                      <option value="">År</option>
                      {Array.from({ length: 50 }, (_, i) => {
                        const year = new Date().getFullYear() - i
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="block mb-2 text-sm font-normal text-gray-700">Slutdatum</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      {...register(`workExperience.${index}.endDate`)}
                      className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors px-3 py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={field.current}
                    >
                      <option value="">Månad</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = new Date(0, i).toLocaleString("sv-SE", { month: "long" })
                        return (
                          <option key={i} value={i + 1}>
                            {capitalizeFirstLetter(month)}
                          </option>
                        )
                      })}
                    </select>
                    <select
                      {...register(`workExperience.${index}.endYear`)}
                      className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors px-3 py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={field.current}
                    >
                      <option value="">År</option>
                      {Array.from({ length: 50 }, (_, i) => {
                        const year = new Date().getFullYear() - i
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Switch
                    checked={field.current}
                    onCheckedChange={(checked) => {
                      setValue(`workExperience.${index}.current`, checked)
                      if (checked) {
                        setValue(`workExperience.${index}.endDate`, "")
                        setValue(`workExperience.${index}.endYear`, "")
                      }
                    }}
                  />
                  <Label className="text-sm font-normal text-gray-700 cursor-pointer" onClick={() => {
                    const current = field.current
                    setValue(`workExperience.${index}.current`, !current)
                    if (!current) {
                      setValue(`workExperience.${index}.endDate`, "")
                      setValue(`workExperience.${index}.endYear`, "")
                    }
                  }}>
                    Nutid
                  </Label>
                </div>
              </div>

              {/* Beskrivning */}
              <div>
                <Label className="block mb-2 text-sm font-normal text-gray-700">Beskrivning</Label>
                <RichTextEditor
                  name={`workExperience.${index}.description`}
                  control={control}
                  defaultValue={field.description}
                />
              </div>

              {/* Action buttons */}
              <div className="absolute right-6 bottom-3 flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 border-gray-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(index)
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
                    collapseField()
                  }}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  Klar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const Experience: React.FC = () => {
  const { register, control, watch, setValue } = useFormContext()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "workExperience",
  })

  const [openFields, setOpenFields] = useState<number[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const hasInitialized = useRef(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const watchFieldArray = watch("workExperience") || []

  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index],
    }
  })

  const handleAddNew = () => {
    const newIndex = fields.length
    append({
      title: "",
      company: "",
      location: "",
      startDate: "",
      startYear: "",
      endDate: "",
      endYear: "",
      current: false,
      description: "",
    })
    // Always open only the newly added field (no setTimeout to avoid animation)
    setOpenFields([newIndex])
  }

  // Initialize first field only once
  useEffect(() => {
    if (!hasInitialized.current && fields.length === 0) {
      hasInitialized.current = true
      append({
        title: "",
        company: "",
        location: "",
        startDate: "",
        startYear: "",
        endDate: "",
        endYear: "",
        current: false,
        description: "",
      })
      setOpenFields([0])
    }
  }, [fields.length, append])

  const toggleField = (index: number) => {
    setOpenFields((prev) => 
      prev.includes(index) ? prev.filter((i) => i !== index) : [index]
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id)
      const newIndex = fields.findIndex((field) => field.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex)
      }
    }
    
    setActiveId(null)
  }

  if (controlledFields.length === 0) {
    return null
  }

  const activeField = activeId ? controlledFields.find(f => f.id === activeId) : null

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {controlledFields.map((field, index) => (
            <SortableExperienceItem
              key={field.id}
              field={field}
              index={index}
              isOpen={openFields.includes(index)}
              onToggle={toggleField}
              onRemove={remove}
              register={register}
              control={control}
              setValue={setValue}
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeId && activeField ? (
            <div className="bg-white rounded-md border border-gray-400 shadow-lg">
              {activeField.isPageBreak ? (
                <div className="mb-3 flex items-center gap-3 py-4 px-4 min-h-[60px]">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 border-t-2 border-gray-300"></div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Sidbrytning</span>
                  <div className="flex-1 border-t-2 border-gray-300"></div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-900 text-sm font-medium">
                        {activeField.title || activeField.company ? `${activeField.title}` : "Ny erfarenhet"}
                      </span>
                      {(activeField.company || activeField.startDate || activeField.startYear) && (
                        <p className="text-gray-500 text-xs">
                          {activeField.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <Button 
        onClick={handleAddNew} 
        variant="outline" 
        size="sm" 
        className="w-full text-sm font-normal px-4 h-11 mt-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
      >
        <Plus className="h-4 w-4 mr-2" />
        Lägg till arbetsliverserfarenhet
      </Button>
    </div>
  )
}

export default Experience
