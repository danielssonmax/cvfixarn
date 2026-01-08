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

// Sortable item component for drag and drop
function SortableEducationItem({ 
  field, 
  index, 
  isOpen, 
  onToggle,
  onRemove,
  register,
  control,
  setValue
}: any) {
  // Always use the field.id from react-hook-form's useFieldArray
  // This ensures consistency between what we render and what we track
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

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
      <div className="mb-3 flex items-start gap-3">
        {/* Grip handle - always visible */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none pt-4 -ml-2">
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </div>
        
        <div className="flex-1 -ml-1">
          {!isOpen && (
            <div
              className="flex items-center justify-between w-full p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer rounded-md border border-gray-400"
              onClick={() => onToggle(index)}
            >
              <div className="flex flex-col gap-1 flex-grow">
                <span className="text-gray-900 text-sm font-medium">
                  {field.degree || field.school ? `${field.degree}` : "Ny utbildning"}
                </span>
                {(field.school || field.startDate || field.startYear) && (
                  <p className="text-gray-500 text-xs">
                    {field.school}
                    {field.school && (field.startDate || field.startYear) && " • "}
                    {capitalizeFirstLetter(field.startDate ? new Date(0, Number(field.startDate) - 1).toLocaleString("sv-SE", { month: "long" }) : "")} {field.startYear}
                    {(field.startDate || field.startYear) && " - "}
                    {field.current ? "Nuvarande" : `${capitalizeFirstLetter(field.endDate ? new Date(0, Number(field.endDate) - 1).toLocaleString("sv-SE", { month: "long" }) : "")} ${field.endYear}`}
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
            {/* All the form fields - keeping the existing structure */}
            <div>
              <Label className="block mb-2 text-sm font-normal text-gray-700">Examen/Utbildning</Label>
              <Input
                {...register(`education.${index}.degree`)}
                className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors"
                placeholder=""
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block mb-2 text-sm font-normal text-gray-700">Skola/Universitet</Label>
                <Input
                  {...register(`education.${index}.school`)}
                  className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors"
                  placeholder=""
                />
              </div>
              <div>
                <Label className="block mb-2 text-sm font-normal text-gray-700">Ort</Label>
                <Input
                  {...register(`education.${index}.location`)}
                  className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors"
                  placeholder=""
                />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
              <div>
                <Label className="block mb-2 text-sm font-normal text-gray-700">Startdatum</Label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    {...register(`education.${index}.startDate`)}
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
                    {...register(`education.${index}.startYear`)}
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
                    {...register(`education.${index}.endDate`)}
                    disabled={field.current}
                    className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors px-3 py-2 w-full disabled:opacity-50"
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
                    {...register(`education.${index}.endYear`)}
                    disabled={field.current}
                    className="!border-2 !border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-white focus:!border-[#00bf63] focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none h-11 text-sm rounded-md transition-colors px-3 py-2 w-full disabled:opacity-50"
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

              <div className="flex items-center gap-2 h-11">
                <Switch
                  checked={field.current}
                  onCheckedChange={(checked) => {
                    setValue(`education.${index}.current`, checked)
                    if (checked) {
                      setValue(`education.${index}.endDate`, "")
                      setValue(`education.${index}.endYear`, "")
                    }
                  }}
                  id={`current-${index}`}
                />
                <Label htmlFor={`current-${index}`} className="text-sm text-gray-700 cursor-pointer">
                  Nuvarande
                </Label>
              </div>
            </div>
            <div>
              <Label className="block mb-2 text-sm font-normal text-gray-700">Beskrivning</Label>
              <RichTextEditor
                name={`education.${index}.description`}
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
                  onToggle(index)
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

export const Education: React.FC = () => {
  const { control, register, watch, setValue } = useFormContext()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "education",
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

  const watchFieldArray = watch("education")
  const controlledFields = fields.map((field, index) => ({
    ...field,
    ...watchFieldArray[index],
  }))

  const handleAddNew = () => {
    const newIndex = fields.length
    append({
      degree: "",
      school: "",
      location: "",
      startDate: "",
      startYear: "",
      endDate: "",
      endYear: "",
      current: false,
      description: "",
    })
    setOpenFields([newIndex])
  }

  useEffect(() => {
    if (!hasInitialized.current && fields.length === 0) {
      hasInitialized.current = true
      append({
        degree: "",
        school: "",
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
  }, [])

  const collapseField = (index: number) => {
    setOpenFields((prev) => prev.filter((i) => i !== index))
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
    const monthIndex = Number.parseInt(date, 10) - 1
    const monthName = monthNames[monthIndex] || ""
    return `${monthName} ${year}`.trim()
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    console.log('DragEnd - active.id:', active.id, 'over.id:', over?.id)
    console.log('Fields:', fields.map(f => ({ id: f.id, isPageBreak: (f as any).isPageBreak })))
    
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id)
      const newIndex = fields.findIndex((field) => field.id === over.id)
      
      console.log('Moving from index', oldIndex, 'to', newIndex)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex)
      }
    }
    
    setActiveId(null)
  }

  const toggleField = (index: number) => {
    setOpenFields((prev) => 
      prev.includes(index) ? prev.filter((i) => i !== index) : [index]
    )
  }

  if (controlledFields.length === 0) {
    return null
  }

  const activeField = activeId ? controlledFields.find(f => f.id === activeId) : null
  const activeIndex = activeId ? fields.findIndex(f => f.id === activeId) : -1

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
            <SortableEducationItem
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
                        {activeField.degree || activeField.school ? `${activeField.degree}` : "Ny utbildning"}
                      </span>
                      {(activeField.school || activeField.startDate || activeField.startYear) && (
                        <p className="text-gray-500 text-xs">
                          {activeField.school}
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
        Lägg till utbildning
      </Button>
    </div>
  )
}

export default Education
