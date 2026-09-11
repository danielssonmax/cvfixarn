"use client"

import React, { useCallback, useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from "react"
import Link from "next/link"
import Image from "next/image"
import { useForm, FormProvider, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import PreviewBridge from "@/components/PreviewBridge"
import {
  LayoutIcon,
  Type,
  TextIcon as TextSize,
  Palette,
  ChevronDown,
  Check,
  ChevronUp,
  Eye,
  EyeOff,
  Save,
  Download,
  Plus,
  Trash2,
  GripVertical,
  AlignJustify,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  CheckCircle2,
  MoreVertical,
  Pencil,
  List,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PersonalInfo } from "@/components/resume-sections/PersonalInfo"
import { Experience } from "@/components/resume-sections/Experience"
import { Education } from "@/components/resume-sections/Education"
import { Skills } from "@/components/resume-sections/Skills"
import { Languages } from "@/components/resume-sections/Languages"
import { DownloadPopup } from "@/components/download-popup"
import CapturePayment from "@/components/capture-payment"
import { SignupPopup } from "@/components/signup-popup"
import { LoginPopup } from "@/components/login-popup"
import { Courses } from "@/components/resume-sections/Courses"
import { Internship } from "@/components/resume-sections/Internship"
import { Profile } from "@/components/resume-sections/Profile"
import { References } from "@/components/resume-sections/References"
import { Traits } from "@/components/resume-sections/Traits"
import { Certificates } from "@/components/resume-sections/Certificates"
import { Achievements } from "@/components/resume-sections/Achievements"
import { Hobbies } from "@/components/resume-sections/Hobbies"
import { Awards } from "@/components/resume-sections/Awards"
import { Volunteering } from "@/components/resume-sections/Volunteering"
import { Licenses } from "@/components/resume-sections/Licenses"
import { CustomSection } from "@/components/resume-sections/CustomSection"
import { templates } from "@/components/templates"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { pdf } from '@react-pdf/renderer'
import { DefaultPDFTemplate } from "./templates/default-pdf-template"
import { 
  saveCVToLocalStorage, 
  getCVFromLocalStorage, 
  clearCVFromLocalStorage,
  getOrCreateDraftId,
  getDraftId,
  clearDraftId,
  getCurrentVersion,
  broadcastSyncSuccess,
  subscribeToBroadcast,
} from "@/lib/cv-storage"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebouncedAutosave } from "@/hooks/use-debounced-autosave"

interface FormData {
  personalInfo: {
    title: string
    firstName: string
    lastName: string
    email: string
    phone: string
    location: string
    summary: string
    photo: string
    address: string
    postalCode: string
    optionalFields: {
      [key: string]: boolean
    }
  }
  workExperience: Array<{
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    school: string
    degree: string
    field: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  skills: Array<{
    name: string
    level: string
  }>
  languages: Array<{
    name: string
    level: string
  }>
  // Optional sections hold their entries as an array (profile holds an object)
  sections: {
    [key: string]: any
  }
}

export interface ResumeEditorHandle {
  getSettings: () => {
    selectedTemplate: string
    selectedFont: string
    fontSize: string
    fontSizePixels: string
    lineHeight: string
    selectedColor: string
    headerColor: string
    addedSections: string[]
  }
  updateSettings: (settings: {
    selectedTemplate?: string
    selectedFont?: string
    fontSize?: string
    fontSizePixels?: string
    lineHeight?: string
    selectedColor?: string
    headerColor?: string
  }) => void
}

interface ResumeEditorProps {
  selectedTemplate?: string
  onSelectTemplate?: (template: string) => void
  form?: any
}

// Short guidance shown under a section heading while it is open, so the user
// knows what belongs in it and how much to write.
const SECTION_HINTS: { [key: string]: string } = {
  personalInfo:
    "Fyll i namn, kontaktuppgifter och den roll du söker. Foto är frivilligt \u2013 ta med det bara om det är vanligt i din bransch.",
  profile:
    "Sammanfatta dig själv på tre till fem meningar. Lyft fram din erfarenhet, dina starkaste sidor och vad du vill bidra med.",
  experience:
    "Ange minst dina två senaste arbetsplatser, gärna fler. Undvik helst arbeten som ligger mer än fem år tillbaka i tiden.",
  education:
    "Börja med din senaste utbildning. Har du läst på högskola eller yrkesutbildning behöver du sällan ta med grundskolan.",
  skills:
    "Välj sex till tio färdigheter som är relevanta för tjänsten du söker. Blanda gärna tekniska kunskaper med personliga styrkor.",
  languages:
    "Ta med de språk du faktiskt kan använda i arbetet och var ärlig med nivån. Svenska och engelska är nästan alltid värda att ange.",
  courses:
    "Ta med kurser som stärker din ansökan, helst sådana du gått de senaste åren. Ange kursnamn, arrangör och årtal.",
  internship:
    "Praktik räknas som erfarenhet. Beskriv vad du gjorde och vad du lärde dig, precis som för ett vanligt arbete.",
  hobbies:
    "Några få intressen räcker. Välj sådana som säger något om dig \u2013 exempelvis lagarbete, uthållighet eller eget skapande.",
  traits:
    "Välj fem till sex egenskaper som beskriver dig i arbetslivet. Se till att de stöds av det du skrivit i resten av ditt CV.",
  certificates:
    "Ta med certifikat som fortfarande är aktuella och relevanta för rollen. Ange utfärdare och årtal så blir de lättare att verifiera.",
  achievements:
    "Konkreta resultat gör störst intryck. Beskriv vad du åstadkom och sätt gärna siffror på det.",
  references:
    "Ange två personer som kan intyga hur du är att arbeta med, eller lämna avsnittet tomt så står det att referenser ges på begäran. Fråga alltid personerna först.",
  awards:
    "Utmärkelser visar att andra har uppmärksammat ditt arbete. Ange vem som delade ut den och när.",
  volunteering:
    "Ideellt arbete visar engagemang och ansvarstagande, och är särskilt värdefullt om du har luckor i ditt CV.",
  licenses:
    "Ta med licenser och behörigheter som krävs eller är meriterande för tjänsten, till exempel körkort, truckkort eller branschcertifikat.",
  custom:
    "Byt namn på rubriken till något som passar dig, till exempel Publikationer, Projekt eller Uppdrag.",
}

// SortableItem component defined OUTSIDE to avoid closure issues
function SortableItem({ 
  id, 
  section,
  isOpen,
  onToggle,
  onRemove,
  onAddPageBreak,
  onRename
}: { 
  id: string;
  section: any;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAddPageBreak: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}) {
  // Safety check: if section is undefined, return null
  if (!section) {
    return null
  }
  
  // Disable dragging for personalInfo
  const isDraggable = id !== 'personalInfo'
  const [mounted, setMounted] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(section.title)
  const [originalName, setOriginalName] = useState(section.title)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Update originalName when section.title changes (for initial load)
  useEffect(() => {
    if (!isRenaming) {
      setOriginalName(section.title)
      setNewName(section.title)
    }
  }, [section.title, isRenaming])
  
  const handleRename = () => {
    const trimmedName = newName.trim()
    if (trimmedName) {
      onRename(id, trimmedName)
    } else {
      // If empty, restore original name
      setNewName(originalName)
      onRename(id, originalName)
    }
    setIsRenaming(false)
  }
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled: !isDraggable
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!section) return null
  
  // Don't render hidden sections
  if (section.hidden) return null

  // Don't show content when dragging to avoid weird compressed ghost image
  const showContent = isOpen && !isDragging
  
  // Sections that support page breaks (have items)
  const supportsPageBreaks = ['experience', 'education', 'courses', 'internship', 'certificates', 'achievements', 'references', 'awards', 'volunteering', 'licenses', 'custom'].includes(id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-0' : ''} ${showContent ? 'bg-white rounded-xl ring-1 ring-gray-200 shadow-sm my-3' : 'border-b border-gray-100'} transition-all`}
    >
      <div className={`${section.hidden ? "opacity-50" : ""} transition-all`}>
        <div
          className={`flex w-full items-start justify-between gap-2 py-4 group transition-colors duration-200 cursor-pointer rounded-xl ${showContent ? 'px-4' : 'px-2 hover:bg-gray-50'}`}
          onClick={() => onToggle(id)}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-5 shrink-0 pt-0.5">
              {mounted && id !== 'personalInfo' && (
                <div 
                  {...attributes} 
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing touch-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600 active:text-[#00bf63] transition-colors" />
                </div>
              )}
            </div>
            <div className="min-w-0">
            {isRenaming ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    const text = e.currentTarget.textContent || ''
                    setNewName(text)
                  }}
                  onBlur={(e) => {
                    const text = e.currentTarget.textContent?.trim() || ''
                    if (text === '') {
                      // If empty, restore original name
                      setNewName(originalName)
                      onRename(id, originalName)
                    } else {
                      handleRename()
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const text = e.currentTarget.textContent?.trim() || ''
                      if (text === '') {
                        setNewName(originalName)
                        onRename(id, originalName)
                      }
                      handleRename()
                    } else if (e.key === 'Escape') {
                      e.currentTarget.textContent = originalName
                      setNewName(originalName)
                      setIsRenaming(false)
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  ref={(el) => {
                    if (el) {
                      el.textContent = newName
                      el.focus()
                      // Move cursor to end
                      const range = document.createRange()
                      const sel = window.getSelection()
                      range.selectNodeContents(el)
                      range.collapse(false)
                      sel?.removeAllRanges()
                      sel?.addRange(range)
                    }
                  }}
                  className="font-medium text-base transition-colors text-gray-900"
                  style={{
                    background: 'transparent',
                    outline: 'none',
                    display: 'inline-block',
                    borderBottom: '2px solid #00bf63',
                    cursor: 'text',
                    paddingLeft: '4px',
                    paddingRight: '4px',
                    minWidth: newName ? 'auto' : `${originalName.length * 8.5 + 8}px`,
                    minHeight: '1.5em'
                  }}
                />
                {!newName && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '4px',
                      top: '0',
                      color: '#9ca3af',
                      pointerEvents: 'none',
                      fontWeight: '500',
                      fontSize: '1rem'
                    }}
                  >
                    {originalName}
                  </span>
                )}
              </div>
            ) : (
              <span 
                className={`font-medium text-base transition-colors cursor-pointer ${showContent ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsRenaming(true)
                }}
              >
                {section.title}
              </span>
            )}
            {showContent && SECTION_HINTS[id] && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                {SECTION_HINTS[id]}
              </p>
            )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {section.removable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer mr-2 transition-opacity ${showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsRenaming(true)
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Byt namn
                  </DropdownMenuItem>
                  {supportsPageBreaks && (
                    <DropdownMenuItem
                      onClick={() => {
                        onAddPageBreak(id)
                      }}
                    >
                      <AlignJustify className="h-4 w-4 mr-2" />
                      Lägg till sidbrytning
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      onRemove(id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Ta bort
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <div>
              {showContent ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>
      {showContent && (
        <div className="px-4 pb-5 space-y-3">
          {section.id === "personalInfo" && <PersonalInfo />}
          {section.id === "experience" && <Experience />}
          {section.id === "education" && <Education />}
          {section.id === "skills" && <Skills />}
          {section.id === "languages" && <Languages />}
          {section.id === "courses" && <Courses />}
          {section.id === "internship" && <Internship />}
          {section.id === "profile" && <Profile />}
          {section.id === "hobbies" && <Hobbies />}
          {section.id === "references" && <References />}
          {section.id === "traits" && <Traits />}
          {section.id === "certificates" && <Certificates />}
          {section.id === "achievements" && <Achievements />}
          {section.id === "awards" && <Awards />}
          {section.id === "volunteering" && <Volunteering />}
          {section.id === "licenses" && <Licenses />}
          {section.id === "custom" && <CustomSection />}
        </div>
      )}
    </div>
  )
}

// Optional sections keep their entries directly at sections.<id> (useFieldArray),
// while CVs saved earlier nested them under sections.<id>.items. Read both shapes.
const sectionItems = (sections: any, id: string, fallback?: any): any[] => {
  const value = sections?.[id]
  const items = Array.isArray(value) ? value : (Array.isArray(value?.items) ? value.items : [])
  if (items.length > 0) return items
  return Array.isArray(fallback) ? fallback : items
}

// Helper function to generate UUID
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const ResumeEditor = forwardRef<ResumeEditorHandle, ResumeEditorProps>(({ selectedTemplate: externalTemplate = "default", onSelectTemplate, form: externalForm }, ref) => {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Create a SINGLE Supabase client instance for this component
  const supabaseClientRef = useRef(createClientComponentClient())
  const supabaseClient = supabaseClientRef.current
  
  // Sync Supabase session cookies from client to server
  useEffect(() => {
    let cancelled = false
    
    ;(async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!cancelled && session) {
        await fetch('/api/auth/sync', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        })
      }
    })()
    
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetch('/api/auth/sync', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        })
        
        // When user signs in, sync any unsaved CV data to the database, then clear localStorage
        if (event === 'SIGNED_IN') {
          const localCV = getCVFromLocalStorage()
          // Use live form values (most up-to-date) with localStorage as fallback for settings
          const currentFormData = form.getValues()
          const hasFormData = currentFormData?.personalInfo?.firstName || currentFormData?.personalInfo?.lastName || currentFormData?.personalInfo?.email
          const hasLocalData = localCV && (localCV.personal_info?.firstName || localCV.personal_info?.email)

          if ((hasFormData || hasLocalData) && session.user) {
            try {
              // Prefer live form state for field data; use localStorage for settings
              const formattedData = {
                skills: currentFormData?.sections?.skills?.items || currentFormData?.skills || localCV?.skills || [],
                password: "",
                projects: [],
                education: currentFormData?.sections?.education?.items || currentFormData?.education || localCV?.education || [],
                languages: currentFormData?.sections?.languages?.items || currentFormData?.languages || localCV?.languages || [],
                experience: (currentFormData?.sections?.experience?.items || currentFormData?.workExperience || localCV?.work_experience || []).map((exp: any) => ({
                  title: exp.title || "",
                  company: exp.company || "",
                  current: exp.current || false,
                  endDate: exp.endDate || "",
                  endYear: exp.endYear || "",
                  location: exp.location || "",
                  startDate: exp.startDate || "",
                  startYear: exp.startYear || "",
                  description: exp.description || ""
                })),
                references: sectionItems(currentFormData?.sections, 'references', localCV?.references),
                personalInfo: {
                  ...(currentFormData?.personalInfo || localCV?.personal_info || {}),
                },
                certifications: sectionItems(currentFormData?.sections, 'certificates', localCV?.certificates),
                courses: sectionItems(currentFormData?.sections, 'courses', localCV?.courses),
                internships: sectionItems(currentFormData?.sections, 'internship', localCV?.internships),
                achievements: sectionItems(currentFormData?.sections, 'achievements', localCV?.achievements),
                traits: sectionItems(currentFormData?.sections, 'traits', localCV?.traits),
                hobbies: sectionItems(currentFormData?.sections, 'hobbies', localCV?.hobbies),
                awards: sectionItems(currentFormData?.sections, 'awards', localCV?.awards),
                volunteering: sectionItems(currentFormData?.sections, 'volunteering', localCV?.volunteering),
                licenses: sectionItems(currentFormData?.sections, 'licenses', localCV?.licenses),
                custom: sectionItems(currentFormData?.sections, 'custom', localCV?.custom),
                profile: currentFormData?.sections?.profile || localCV?.profile || null,
                workExperience: [],
                _settings: {
                  selectedTemplate: localCV?.selected_template || selectedTemplate || 'default',
                  selectedFont: localCV?.selected_font || selectedFont || 'Poppins',
                  fontSize: localCV ? (localCV.font_size === 9 ? 'XS' : localCV.font_size === 10 ? 'S' : localCV.font_size === 11 ? 'M' : localCV.font_size === 12 ? 'L' : localCV.font_size === 13 ? 'XL' : 'M') : fontSize || 'M',
                  fontSizePixels: localCV ? (localCV.font_size === 9 ? '12px' : localCV.font_size === 10 ? '14px' : localCV.font_size === 11 ? '16px' : localCV.font_size === 12 ? '18px' : localCV.font_size === 13 ? '20px' : '16px') : fontSizePixels || '16px',
                  lineHeight: localCV?.line_height?.toString() || lineHeight || '1.5',
                  selectedColor: localCV?.selected_color || selectedColor || '#000000',
                  headerColor: localCV?.header_color || headerColor || '#000000',
                  sectionOrder: localCV?.section_order || addedSections || ['personalInfo', 'profile', 'experience', 'education', 'skills', 'languages'],
                },
              }

              const localCvId = localCV?.id || cvId
              const cvTitle = localCV?.cv_name || cvName || 'Untitled CV'

              await fetch('/api/save-cv', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  id: localCvId,
                  user_id: session.user.id,
                  title: cvTitle,
                  data: formattedData,
                }),
              })

              // Update the URL to point to the synced CV if needed
              if (localCvId && localCvId !== cvId) {
                setCvId(localCvId)
                window.history.replaceState(null, '', `/profil/skapa-cv?id=${localCvId}`)
              }

              // Reset so the [user, cvId] effect will re-load from DB with the synced data
              hasLoadedFromDBRef.current = false
              setHasLoadedInitialData(false)
            } catch (syncError) {
              console.error('Failed to sync CV to database:', syncError)
            }
          }
          clearCVFromLocalStorage()
        }
      }
    })
    
    return () => { 
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])
  
  // Temporary diagnostics - verify login set cookies
  useEffect(() => {
    if (user) {
      // Check if we can call whoami
      fetch('/api/whoami', { credentials: 'include' })
        .then(r => r.json())
    }
  }, [user])
  
  // Initialize cvId from URL or create a new one
  const [cvId, setCvId] = useState<string | null>(() => {
    const urlId = searchParams.get('id')
    const isNew = searchParams.get('new')
    
    if (urlId && urlId !== 'new') return urlId
    if (isNew === 'true') {
      // User explicitly wants to create a new CV
      const newId = generateUUID()
      return newId
    }
    
    // No ID in URL - will auto-redirect to latest CV or mina-cv page
    return null
  })
  
  const [shouldRedirect, setShouldRedirect] = useState(false)
  
  // Extract URL params as strings to avoid object reference issues
  const urlId = searchParams.get('id')
  const isNew = searchParams.get('new')
  
  // Auto-redirect logic when no CV ID in URL
  useEffect(() => {
    // Skip redirect if we already have an ID in URL or are creating a new CV
    if (urlId || isNew === 'true' || cvId !== null || shouldRedirect) return
    
    const handleRedirect = async () => {
      if (!user) {
        // Not logged in - create new CV
        const newId = generateUUID()
        setCvId(newId)
        window.history.replaceState(null, '', `/profil/skapa-cv?id=${newId}`)
        return
      }
      
      // Logged in - check if user has any CVs
      try {
        setShouldRedirect(true)
        const response = await fetch('/api/get-user-cvs', {
          credentials: 'include',
        })
        const result = await response.json()
        
        if (result.success && result.cvs && result.cvs.length > 0) {
          // User has CVs - redirect to latest one
          const latestCV = result.cvs[0] // Already sorted by updated_at DESC
          router.push(`/profil/skapa-cv?id=${latestCV.id}`)
        } else {
          // User has no CVs - redirect to profil page
          router.push('/profil')
        }
      } catch (error) {
        // On error, create new CV
        const newId = generateUUID()
        setCvId(newId)
        window.history.replaceState(null, '', `/profil/skapa-cv?id=${newId}`)
      }
    }
    
    handleRedirect()
  }, [cvId, user, shouldRedirect, router, urlId, isNew])
  
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showCapturePayment, setShowCapturePayment] = useState(false)
  const [showSignupPopup, setShowSignupPopup] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Sync cvId with URL changes (when navigating between CVs)
  useEffect(() => {
    const urlId = searchParams.get('id')
    if (urlId && urlId !== cvId) {
      setCvId(urlId)
    }
  }, [searchParams, cvId])
  
  // Set URL with cvId on mount
  useEffect(() => {
    if (cvId && !searchParams.get('id')) {
      window.history.replaceState(null, '', `/profil/skapa-cv?id=${cvId}`)
    }
  }, [cvId, searchParams])

  // Create internal form if not provided
  const internalForm = useForm<FormData>({
    defaultValues: {
      personalInfo: {
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        summary: "",
        photo: "",
        address: "",
        postalCode: "",
        optionalFields: {},
      },
      workExperience: [],
      education: [],
      skills: [],
      languages: [],
      sections: {
        profile: { description: "" },
        hobbies: [],
        courses: [],
        internship: [],
        traits: [],
        certificates: [],
        achievements: [],
        references: [],
        awards: [],
        volunteering: [],
        licenses: [],
        custom: [],
        experience: { items: [] },
        education: { items: [] },
        skills: { items: [] },
        languages: { items: [] },
      },
    },
  })

  const form = externalForm || internalForm
  const [selectedTemplate, setSelectedTemplate] = useState("default")

  // Initialize template from prop on mount only, never update after that
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (!hasInitialized.current && externalTemplate) {
      setSelectedTemplate(externalTemplate)
      hasInitialized.current = true
    }
  }, [])

  // Never sync back to parent to prevent loops

  const titles: { [key: string]: string } = {
    personalInfo: "Grundläggande uppgifter",
    education: "Utbildning",
    experience: "Yrkeslivserfarenhet",
    skills: "Färdigheter",
    languages: "Språk",
    profile: "Personuppgifter",
    courses: "Kurser",
    internship: "Praktikplatser",
    references: "Referenser",
    traits: "Egenskaper",
    certificates: "Certifikat",
    achievements: "Prestationer",
    awards: "Utmärkelser",
    volunteering: "Volontärarbete",
    licenses: "Licenser",
    custom: "Skräddarsytt fält",
  }

  // Smal prenumeration - endast sections (inte hela formuläret)
  const watchedSections = useWatch({ control: form.control, name: "sections" })

  const [showScrollbar, setShowScrollbar] = useState(false)
  const formContainerRef = useRef<HTMLDivElement>(null)
  const basicSections = ["personalInfo", "experience", "education", "skills", "languages"]
  const [addedSections, setAddedSections] = useState<string[]>(basicSections)
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false)
  const [selectedFont, setSelectedFont] = useState("Poppins")
  const [fontSize, setFontSize] = useState("M")
  const [fontSizePixels, setFontSizePixels] = useState("16px")
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [showFontMenu, setShowFontMenu] = useState(false)
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false)
  const [showLineHeightMenu, setShowLineHeightMenu] = useState(false)
  const [lineHeight, setLineHeight] = useState("1.0")
  const [openSections, setOpenSections] = useState<string[]>(["personalInfo"])
  const [headerColor, setHeaderColor] = useState("#000000")
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const [showMoreFieldsMenu, setShowMoreFieldsMenu] = useState(false)
  const moreFieldsDropdownRef = useRef<HTMLDivElement>(null)

  // Expose settings getters/setters to parent via ref
  useImperativeHandle(ref, () => ({
    getSettings: () => ({
      selectedTemplate,
      selectedFont,
      fontSize,
      fontSizePixels,
      lineHeight,
      selectedColor,
      headerColor,
      addedSections,
    }),
    updateSettings: (settings) => {
      if (settings.selectedTemplate !== undefined) setSelectedTemplate(settings.selectedTemplate)
      if (settings.selectedFont !== undefined) setSelectedFont(settings.selectedFont)
      if (settings.fontSize !== undefined) setFontSize(settings.fontSize)
      if (settings.fontSizePixels !== undefined) setFontSizePixels(settings.fontSizePixels)
      if (settings.lineHeight !== undefined) setLineHeight(settings.lineHeight)
      if (settings.selectedColor !== undefined) setSelectedColor(settings.selectedColor)
      if (settings.headerColor !== undefined) setHeaderColor(settings.headerColor)
    },
  }), [selectedTemplate, selectedFont, fontSize, fontSizePixels, lineHeight, selectedColor, headerColor, addedSections])
  const lineHeightDropdownRef = useRef<HTMLDivElement>(null)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [cvName, setCvName] = useState("cv.pdf")
  const [isEditingName, setIsEditingName] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [isSavingChanges, setIsSavingChanges] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<number>(0)
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)
  const hasSyncedRef = useRef(false)

  const [staticSectionSections, setStaticSectionSections] = useState([
    { id: "personalInfo", title: "Personuppgifter", component: PersonalInfo, removable: false, hidden: false },
    { id: "experience", title: "Yrkeslivserfarenhet", component: Experience, removable: true, hidden: false },
    { id: "education", title: "Utbildning", component: Education, removable: true, hidden: false },
    { id: "skills", title: "Färdigheter", component: Skills, removable: true, hidden: false },
    { id: "languages", title: "Språk", component: Languages, removable: true, hidden: false }
  ])

  const fontSizeDropdownRef = useRef<HTMLDivElement>(null)
  const fontDropdownRef = useRef<HTMLDivElement>(null)
  const templateDropdownRef = useRef<HTMLDivElement>(null)

  const [optionalSections, setOptionalSections] = useState([
    { id: "profile", title: "Profil", component: Profile },
    { id: "courses", title: "Kurser", component: Courses },
    { id: "internship", title: "Praktik", component: Internship },
    { id: "hobbies", title: "Hobby", component: Hobbies },
    { id: "traits", title: "Egenskaper", component: Traits },
    { id: "certificates", title: "Certifikat", component: Certificates },
    { id: "achievements", title: "Prestationer", component: Achievements },
    { id: "awards", title: "Utmärkelser", component: Awards },
    { id: "volunteering", title: "Volontärarbete", component: Volunteering },
    { id: "licenses", title: "Licenser", component: Licenses },
    { id: "references", title: "Referenser", component: References },
    { id: "custom", title: "Skräddarsytt fält", component: CustomSection }
  ])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFontSizeMenu && fontSizeDropdownRef.current) {
        if (!fontSizeDropdownRef.current.contains(event.target as Node)) {
          setShowFontSizeMenu(false)
        }
      }
      if (showFontMenu && fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setShowFontMenu(false)
      }
      if (showLineHeightMenu && lineHeightDropdownRef.current && !lineHeightDropdownRef.current.contains(event.target as Node)) {
        setShowLineHeightMenu(false)
      }
      if (
        showTemplateMenu &&
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTemplateMenu(false)
      }
      if (
        showMoreFieldsMenu &&
        moreFieldsDropdownRef.current &&
        !moreFieldsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMoreFieldsMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showFontSizeMenu, showFontMenu, showLineHeightMenu, showTemplateMenu, showMoreFieldsMenu])

  // Removed overflow checking to prevent infinite loops
  // useEffect(() => {
  //   ...overflow checking code...
  // }, [])

  // Check if user has premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsSubscribed(false)
        return
      }
      
      try {
        const { data, error } = await supabase
          .from('premium')
          .select('premium')
          .eq('uid', user.id)
          .single()
        
        if (error) {
          console.log('No premium record found:', error.message)
          setIsSubscribed(false)
          return
        }
        
        if (data?.premium === 'true') {
          console.log('User has premium status')
          setIsSubscribed(true)
        } else {
          console.log('User premium status:', data?.premium)
          setIsSubscribed(false)
        }
      } catch (err) {
        console.error('Error checking premium status:', err)
        setIsSubscribed(false)
      }
    }
    
    checkPremiumStatus()
  }, [user])

  const handleSectionUpdate = useCallback(
    (sectionId: string, value: string) => {
      form.setValue(`${sectionId}.content`, value)
    },
    [form],
  )

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) => (prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]))
  }, [])

  const handleAddPageBreak = useCallback((sectionId: string) => {
    
    // Map section ID to correct field name
    let fieldName: string
    if (sectionId === 'experience') {
      fieldName = 'workExperience'
    } else if (sectionId === 'education') {
      fieldName = 'education'
    } else if (['courses', 'internship', 'certificates', 'achievements', 'references'].includes(sectionId)) {
      fieldName = `sections.${sectionId}`
    } else {
      console.warn('Page breaks not supported for section:', sectionId)
      return
    }
    
    const currentValues = form.getValues(fieldName) || []
    
    if (Array.isArray(currentValues)) {
      // Add page break as first item - don't specify ID, let react-hook-form generate it
      form.setValue(fieldName, [
        { isPageBreak: true },
        ...currentValues
      ])
    }
  }, [form])

  const handleRenameSection = useCallback((id: string, newName: string) => {
    
    // Update the section title in staticSectionSections
    setStaticSectionSections((prev) => 
      prev.map((section) => 
        section.id === id ? { ...section, title: newName } : section
      )
    )
    
    // Also update in optionalSections if it exists there
    setOptionalSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, title: newName } : section
      )
    )
  }, [])

  const handleRemoveSection = useCallback((id: string) => {
    
    if (id !== "personalInfo") {
      // Clear all data for the section - PreviewBridge will handle filtering
      if (id === 'experience') {
        form.setValue('workExperience', [])
      } else if (id === 'education') {
        form.setValue('education', [])
      } else if (id === 'skills') {
        form.setValue('skills', [])
      } else if (id === 'languages') {
        form.setValue('languages', [])
      } else {
        // For optional sections
        form.setValue(`sections.${id}`, undefined)
      }
      
      // Update UI - for basic sections, keep them in addedSections but mark as hidden
      if (basicSections.includes(id)) {
        // DON'T remove from addedSections - keep sectionOrder stable
        setStaticSectionSections(prev => 
          prev.map(section => 
            section.id === id ? { ...section, hidden: true } : section
          )
        )
      } else {
        // For optional sections, remove completely
        setAddedSections(prev => prev.filter(sectionId => sectionId !== id))
        setStaticSectionSections(prev => prev.filter(section => section.id !== id))
        setOpenSections(prev => prev.filter(sectionId => sectionId !== id))
      }
    } else {
    }
  }, [form, addedSections, basicSections])

  const handleMoveSection = useCallback(
    (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex >= 0 && newIndex < addedSections.length) {
        const newSections = [...addedSections]
        ;[newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]]
        setAddedSections(newSections)
      }
    },
    [addedSections],
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [activeId, setActiveId] = useState<string | null>(null)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Prevent moving any section to position 0 (personalInfo must stay first)
      // Also prevent moving personalInfo itself
      if (active.id === 'personalInfo' || over.id === 'personalInfo') {
        setActiveId(null)
        return
      }
      
      // Update addedSections
      setAddedSections((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        
        // Double check: if newIndex would be 0, don't allow it
        if (newIndex === 0) return items
        
        return arrayMove(items, oldIndex, newIndex)
      })
      
      // Update staticSectionSections using the same arrayMove logic
      setStaticSectionSections((prevSections) => {
        const oldIndex = prevSections.findIndex(s => s.id === active.id)
        const newIndex = prevSections.findIndex(s => s.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return prevSections
        
        // Double check: if newIndex would be 0, don't allow it
        if (newIndex === 0) return prevSections
        
        return arrayMove(prevSections, oldIndex, newIndex)
      })
    }
    
    setActiveId(null)
  }, [])

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setStaticSectionSections((prevSections) =>
      prevSections.map((s) => (s.id === sectionId ? { ...s, hidden: !s.hidden } : s)),
    )
  }, [])

  const handleFontSizeChange = (size: string) => {
    const sizes = {
      XS: "12px",
      S: "14px",
      M: "16px",
      L: "18px",
      XL: "20px",
    }
    setFontSize(size)
    setFontSizePixels(sizes[size as keyof typeof sizes] || "16px")
    setShowFontSizeMenu(false)
  }

  const handleLineHeightChange = (height: string) => {
    setLineHeight(height)
    setShowLineHeightMenu(false)
  }

  useEffect(() => {}, [])

  // Client-only rendering for DnD-kit to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    
    let loadedCV: any = null
    
    // Don't try to sync on mount - let auto-save handle it after user makes changes
    // This avoids 401 errors when session isn't ready yet
    
    // Load CV from database when there's an ID in the URL
    if (cvId && !hasLoadedFromDBRef.current) {
      hasLoadedFromDBRef.current = true
      
      const loadCVFromDatabase = async () => {
        try {
          // Load by ID; include user_id if logged in for ownership verification
          const url = user
            ? `/api/load-cv?id=${cvId}&user_id=${user.id}`
            : `/api/load-cv?id=${cvId}`
          const response = await fetch(url, { credentials: 'include' })
          const result = await response.json()
          
          if (result.success && result.cv) {
            const savedCV = result.cv
            loadedCV = savedCV
            
            if (savedCV.title) {
              setCvName(savedCV.title)
            }
            
            if (savedCV.data) {
              const cvData = savedCV.data
              
              // Restore personalInfo (same key in both old and new format)
              if (cvData.personalInfo) {
                form.setValue('personalInfo', cvData.personalInfo)
              }
              
              // Restore experience — handle both new format (experience) and old format (workExperience, sections.experience)
              const experienceData = cvData.experience || cvData.workExperience || cvData.sections?.experience?.items || []
              if (Array.isArray(experienceData) && experienceData.length > 0) {
                form.setValue('sections.experience.items', experienceData)
              }
              
              // Restore education — handle both flat and nested
              const educationData = cvData.education || cvData.sections?.education?.items || []
              if (Array.isArray(educationData) && educationData.length > 0) {
                form.setValue('sections.education.items', educationData)
              }
              
              // Restore skills
              const skillsData = cvData.skills || cvData.sections?.skills?.items || []
              if (Array.isArray(skillsData) && skillsData.length > 0) {
                form.setValue('sections.skills.items', skillsData)
              }
              
              // Restore languages
              const languagesData = cvData.languages || cvData.sections?.languages?.items || []
              if (Array.isArray(languagesData) && languagesData.length > 0) {
                form.setValue('sections.languages.items', languagesData)
              }
              
              // Restore references
              const referencesData = cvData.references || sectionItems(cvData?.sections, 'references')
              if (Array.isArray(referencesData) && referencesData.length > 0) {
                form.setValue('sections.references', referencesData)
              }
              
              // Restore certifications
              const certsData = cvData.certifications || sectionItems(cvData?.sections, 'certificates')
              if (Array.isArray(certsData) && certsData.length > 0) {
                form.setValue('sections.certificates', certsData)
              }
              
              // Restore courses
              const coursesData = cvData.courses || sectionItems(cvData?.sections, 'courses')
              if (Array.isArray(coursesData) && coursesData.length > 0) {
                form.setValue('sections.courses', coursesData)
              }
              
              // Restore internships
              const internshipsData = cvData.internships || sectionItems(cvData?.sections, 'internship')
              if (Array.isArray(internshipsData) && internshipsData.length > 0) {
                form.setValue('sections.internship', internshipsData)
              }
              
              // Restore achievements
              const achievementsData = cvData.achievements || sectionItems(cvData?.sections, 'achievements')
              if (Array.isArray(achievementsData) && achievementsData.length > 0) {
                form.setValue('sections.achievements', achievementsData)
              }
              
              // Restore traits
              const traitsData = cvData.traits || sectionItems(cvData?.sections, 'traits')
              if (Array.isArray(traitsData) && traitsData.length > 0) {
                form.setValue('sections.traits', traitsData)
              }
              
              // Restore hobbies
              const hobbiesData = cvData.hobbies || sectionItems(cvData?.sections, 'hobbies')
              if (Array.isArray(hobbiesData) && hobbiesData.length > 0) {
                form.setValue('sections.hobbies', hobbiesData)
              }
              
              // Restore awards
              const awardsData = cvData.awards || sectionItems(cvData?.sections, 'awards')
              if (Array.isArray(awardsData) && awardsData.length > 0) {
                form.setValue('sections.awards', awardsData)
              }

              // Restore volunteering
              const volunteeringData = cvData.volunteering || sectionItems(cvData?.sections, 'volunteering')
              if (Array.isArray(volunteeringData) && volunteeringData.length > 0) {
                form.setValue('sections.volunteering', volunteeringData)
              }

              // Restore licenses
              const licensesData = cvData.licenses || sectionItems(cvData?.sections, 'licenses')
              if (Array.isArray(licensesData) && licensesData.length > 0) {
                form.setValue('sections.licenses', licensesData)
              }

              // Restore custom section entries
              const customData = cvData.custom || sectionItems(cvData?.sections, 'custom')
              if (Array.isArray(customData) && customData.length > 0) {
                form.setValue('sections.custom', customData)
              }

              // Restore profile (handle both object and nested format)
              const profileData = cvData.profile || cvData.sections?.profile || null
              if (profileData) {
                form.setValue('sections.profile', profileData)
              }
              
              // Restore settings from _settings (new format)
              if (cvData._settings) {
                if (cvData._settings.selectedTemplate) setSelectedTemplate(cvData._settings.selectedTemplate)
                if (cvData._settings.selectedFont) setSelectedFont(cvData._settings.selectedFont)
                if (cvData._settings.fontSize) {
                  setFontSize(cvData._settings.fontSize)
                  if (cvData._settings.fontSizePixels) setFontSizePixels(cvData._settings.fontSizePixels)
                }
                if (cvData._settings.lineHeight) setLineHeight(cvData._settings.lineHeight)
                if (cvData._settings.selectedColor) setSelectedColor(cvData._settings.selectedColor)
                if (cvData._settings.headerColor) setHeaderColor(cvData._settings.headerColor)
                if (cvData._settings.sectionOrder && Array.isArray(cvData._settings.sectionOrder)) {
                  setAddedSections(cvData._settings.sectionOrder)
                }
                // Restore renamed section headings (e.g. a renamed "Skräddarsytt fält")
                if (cvData._settings.sectionNames && typeof cvData._settings.sectionNames === 'object') {
                  const namesMap = cvData._settings.sectionNames as { [key: string]: string }
                  setStaticSectionSections(prev =>
                    prev.map(section => ({
                      ...section,
                      title: namesMap[section.id] || section.title
                    }))
                  )
                  setOptionalSections(prev =>
                    prev.map(section => ({
                      ...section,
                      title: namesMap[section.id] || section.title
                    }))
                  )
                }
              }

              // Build section order from data if _settings.sectionOrder not present
              if (!cvData._settings?.sectionOrder) {
                const detectedSections = ['personalInfo']
                if (profileData) detectedSections.push('profile')
                if (experienceData.length > 0) detectedSections.push('experience')
                if (educationData.length > 0) detectedSections.push('education')
                if (skillsData.length > 0) detectedSections.push('skills')
                if (languagesData.length > 0) detectedSections.push('languages')
                if (referencesData.length > 0) detectedSections.push('references')
                if (certsData.length > 0) detectedSections.push('certificates')
                if (coursesData.length > 0) detectedSections.push('courses')
                if (internshipsData.length > 0) detectedSections.push('internship')
                if (achievementsData.length > 0) detectedSections.push('achievements')
                if (traitsData.length > 0) detectedSections.push('traits')
                if (hobbiesData.length > 0) detectedSections.push('hobbies')
                if (awardsData.length > 0) detectedSections.push('awards')
                if (volunteeringData.length > 0) detectedSections.push('volunteering')
                if (licensesData.length > 0) detectedSections.push('licenses')
                if (customData.length > 0) detectedSections.push('custom')
                setAddedSections(detectedSections)
              }
            }
            
            setHasLoadedInitialData(true)
          } else if (response.status === 404) {
            setHasLoadedInitialData(true)
          } else {
            setHasLoadedInitialData(true)
          }
        } catch (error) {
          setHasLoadedInitialData(true)
        }
      }
      
      loadCVFromDatabase()
    }
    // Load CV from localStorage if not logged in (and DB load didn't handle it)
    else if (!user) {
      const savedCV = getCVFromLocalStorage()
      loadedCV = savedCV
      if (savedCV) {
        // Restore settings FIRST (before form data)
        if (savedCV.cv_name) setCvName(savedCV.cv_name)
        if (savedCV.selected_template) setSelectedTemplate(savedCV.selected_template)
        if (savedCV.selected_font) {
          setSelectedFont(savedCV.selected_font)
        }
        if (savedCV.font_size) {
          const size = savedCV.font_size === 9 ? 'XS' : savedCV.font_size === 10 ? 'S' : savedCV.font_size === 11 ? 'M' : savedCV.font_size === 12 ? 'L' : 'XL'
          const pixels = savedCV.font_size === 9 ? '12px' : savedCV.font_size === 10 ? '14px' : savedCV.font_size === 11 ? '16px' : savedCV.font_size === 12 ? '18px' : '20px'
          setFontSize(size)
          setFontSizePixels(pixels)
        }
        if (savedCV.line_height !== undefined) {
          setLineHeight(savedCV.line_height.toString())
        }
        if (savedCV.selected_color) {
          setSelectedColor(savedCV.selected_color)
        }
        if (savedCV.header_color) setHeaderColor(savedCV.header_color)
        
        // Restore section order
        if (savedCV.section_order && Array.isArray(savedCV.section_order)) {
          setAddedSections(savedCV.section_order)
        }
        
        // Restore section names
        if (savedCV.section_names && typeof savedCV.section_names === 'object') {
          const namesMap = savedCV.section_names as { [key: string]: string }
          setStaticSectionSections(prev => 
            prev.map(section => ({
              ...section,
              title: namesMap[section.id] || section.title
            }))
          )
          setOptionalSections(prev =>
            prev.map(section => ({
              ...section,
              title: namesMap[section.id] || section.title
            }))
          )
        }
        
        // Restore form data using reset for complete update
        // Use setTimeout to ensure template is set first
        setTimeout(() => {
          form.reset({
            personalInfo: savedCV.personal_info || {},
            workExperience: savedCV.work_experience || [],
            education: savedCV.education || [],
            skills: savedCV.skills || [],
            languages: savedCV.languages || [],
            sections: {
              profile: savedCV.profile || { description: '' },
              courses: savedCV.courses || [],
              internship: savedCV.internships || [],
              certificates: savedCV.certificates || [],
              achievements: savedCV.achievements || [],
              references: savedCV.references || [],
              traits: savedCV.traits || [],
              hobbies: savedCV.hobbies || [],
              awards: savedCV.awards || [],
              volunteering: savedCV.volunteering || [],
              licenses: savedCV.licenses || [],
              custom: savedCV.custom || [],
            }
          })
          
          setHasLoadedInitialData(true)
        }, 100)
      } else {
        // No saved data - mark as loaded to allow saving new data
        setHasLoadedInitialData(true)
      }
    } else {
      // User is logged in but no cvId - mark as loaded so autosave can work once cvId is assigned
      setHasLoadedInitialData(true)
    }
    
    // Set version from loaded data
    if (loadedCV && loadedCV.version) {
      setCurrentVersion(loadedCV.version)
    }
    
    // Setup BroadcastChannel listener for multi-tab sync
    const unsubscribe = subscribeToBroadcast(
      (data) => {
        // Another tab updated localStorage - reload data
      },
      () => {
        // Another tab cleared localStorage - clear local state
        clearDraftId()
      },
      (newCvId) => {
        // Another tab synced to database - update URL and reload
        if (!cvId) {
          setCvId(newCvId)
          window.history.replaceState(null, '', `/profil/skapa-cv?id=${newCvId}`)
          clearCVFromLocalStorage()
          window.location.reload()
        }
      }
    )
    
    return () => {
      unsubscribe()
    }
  }, [user, cvId])

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    setHeaderColor(color)
  }

  // Uppdatera toggleColorPicker funktionen
  const toggleColorPicker = () => {
    setIsColorPickerOpen((prev) => {
      return !prev
    })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Build CV data from form
  const formData = useWatch({ control: form.control })

  // ---- CV completeness ------------------------------------------------
  // Filling in every field of the visible base sections gets the user to 80%.
  // Each extra section they add is worth another 10%, so two of them - say
  // Prestationer and Referenser - complete the bar.
  const cvProgress = useMemo(() => {
    const filled = (value: any) => (typeof value === "string" ? value.trim() !== "" : !!value)
    const hasText = (html: any) => String(html ?? "").replace(/<[^>]*>/g, "").trim() !== ""
    const entries = (list: any) => (Array.isArray(list) ? list.filter((e: any) => e && !e.isPageBreak) : [])

    // A base section the user has deleted should not be held against them
    const isVisible = (id: string) =>
      addedSections.includes(id) && staticSectionSections.find((sec) => sec.id === id)?.hidden !== true

    const checks: boolean[] = []

    const info = formData?.personalInfo || {}
    checks.push(
      filled(info.firstName),
      filled(info.lastName),
      filled(info.title),
      filled(info.email),
      filled(info.phone),
      filled(info.location),
    )

    if (isVisible("experience")) {
      const items = entries(formData?.workExperience)
      checks.push(
        items.some((e: any) => filled(e.title)),
        items.some((e: any) => filled(e.company)),
        items.some((e: any) => filled(e.startYear) || filled(e.startDate)),
        items.some((e: any) => hasText(e.description)),
      )
    }

    if (isVisible("education")) {
      const items = entries(formData?.education)
      checks.push(
        items.some((e: any) => filled(e.degree)),
        items.some((e: any) => filled(e.school)),
        items.some((e: any) => filled(e.startYear) || filled(e.startDate)),
      )
    }

    if (isVisible("skills")) {
      const named = entries(formData?.skills).filter((e: any) => filled(e.name))
      checks.push(named.length > 0, named.length >= 3)
    }

    if (isVisible("languages")) {
      checks.push(entries(formData?.languages).some((e: any) => filled(e.name)))
    }

    const done = checks.filter(Boolean).length
    const base = checks.length > 0 ? (done / checks.length) * 80 : 0

    const extraSections = addedSections.filter(
      (id) => !basicSections.includes(id) && staticSectionSections.find((sec) => sec.id === id)?.hidden !== true,
    )
    const bonus = Math.min(extraSections.length, 2) * 10

    return {
      percent: Math.round(base + bonus),
      extraCount: extraSections.length,
      baseComplete: checks.length > 0 && done === checks.length,
    }
  }, [formData, addedSections, staticSectionSections, basicSections])

  const progressMessage = (() => {
    if (cvProgress.percent >= 100) return "Ditt CV är komplett \u2013 snyggt jobbat!"
    if (cvProgress.baseComplete) {
      return cvProgress.extraCount >= 1
        ? "Alla fält är ifyllda. Lägg till ett extra avsnitt till, till exempel Prestationer eller Referenser, för att nå 100 %."
        : "Alla fält är ifyllda. Lägg till två extra avsnitt, till exempel Prestationer eller Referenser, för att nå 100 %."
    }
    if (cvProgress.percent >= 40) return "Bra jobbat \u2013 fortsätt fylla i så blir ditt CV starkare."
    return "Fyll i dina uppgifter så växer ditt CV fram."
  })()
  
  // Memoize section names separately to avoid re-creating cvData when sections change
  const sectionNamesMap = useMemo(() => {
    const map: { [key: string]: string } = {}
    staticSectionSections.forEach(section => {
      map[section.id] = section.title
    })
    optionalSections.forEach(section => {
      map[section.id] = section.title
    })
    return map
  }, [staticSectionSections, optionalSections])

  const cvData = useMemo(() => {
    if (!formData) return null
    
    const data = {
      id: cvId,
      // Don't include version in cvData - it's only for optimistic locking, not for autosave trigger
      cv_name: cvName,
      selected_template: selectedTemplate,
      selected_font: selectedFont,
      font_size: fontSize === 'XS' ? 9 : fontSize === 'S' ? 10 : fontSize === 'M' ? 11 : fontSize === 'L' ? 12 : 13,
      line_height: parseFloat(lineHeight),
      selected_color: selectedColor,
      header_color: headerColor,
      personal_info: formData.personalInfo || {},
      work_experience: formData.sections?.experience?.items || formData.workExperience || [],
      education: formData.sections?.education?.items || formData.education || [],
      skills: formData.sections?.skills?.items || formData.skills || [],
      languages: formData.sections?.languages?.items || formData.languages || [],
      profile: formData.sections?.profile || null,
      courses: sectionItems(formData?.sections, 'courses'),
      internships: sectionItems(formData?.sections, 'internship'),
      certificates: sectionItems(formData?.sections, 'certificates'),
      achievements: sectionItems(formData?.sections, 'achievements'),
      references: sectionItems(formData?.sections, 'references'),
      traits: sectionItems(formData?.sections, 'traits'),
      hobbies: sectionItems(formData?.sections, 'hobbies'),
      awards: sectionItems(formData?.sections, 'awards'),
      volunteering: sectionItems(formData?.sections, 'volunteering'),
      licenses: sectionItems(formData?.sections, 'licenses'),
      custom: sectionItems(formData?.sections, 'custom'),
      section_order: addedSections,
      section_names: sectionNamesMap,
    }
    
    return data
  }, [formData, cvId, cvName, selectedTemplate, selectedFont, fontSize, lineHeight, selectedColor, headerColor, addedSections, sectionNamesMap])

  // Track if we've loaded initial data
  const hasLoadedFromDBRef = useRef(false)
  
  // Autosave function with debounce
  const handleAutosave = useCallback(async (data: any) => {
    if (!data || !cvId) return
    
    setIsSavingChanges(true)
    
    try {
      if (!user || !user.id) {
        // Not logged in - save to localStorage only
        saveCVToLocalStorage(data, cvId)
        setTimeout(() => setIsSavingChanges(false), 1000)
        return
      }

      // User is logged in - ONLY save to database, NEVER to localStorage
      try {
        // Get access token for header-based auth fallback
        const { data: { session } } = await supabaseClient.auth.getSession()
        const accessToken = session?.access_token
        
        // Get current form values
        const currentFormData = form.getValues()
        
        // Transform data to match the database format, including all settings
        const formattedData = {
          skills: currentFormData.sections?.skills?.items || currentFormData.skills || [],
          password: "",
          projects: [],
          education: currentFormData.sections?.education?.items || currentFormData.education || [],
          languages: currentFormData.sections?.languages?.items || currentFormData.languages || [],
          experience: (currentFormData.sections?.experience?.items || currentFormData.workExperience || []).map((exp: any) => ({
            title: exp.title || "",
            company: exp.company || "",
            current: exp.current || false,
            endDate: exp.endDate || "",
            endYear: exp.endYear || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            startYear: exp.startYear || "",
            description: exp.description || ""
          })),
          references: sectionItems(currentFormData?.sections, 'references'),
          personalInfo: {
            ...currentFormData.personalInfo,
            email: currentFormData.personalInfo?.email || "",
            phone: currentFormData.personalInfo?.phone || "",
            title: currentFormData.personalInfo?.title || "",
            address: currentFormData.personalInfo?.address || "",
            summary: currentFormData.personalInfo?.summary || "",
            lastName: currentFormData.personalInfo?.lastName || "",
            location: currentFormData.personalInfo?.location || "",
            firstName: currentFormData.personalInfo?.firstName || "",
            postalCode: currentFormData.personalInfo?.postalCode || ""
          },
          certifications: sectionItems(currentFormData?.sections, 'certificates'),
          courses: sectionItems(currentFormData?.sections, 'courses'),
          internships: sectionItems(currentFormData?.sections, 'internship'),
          achievements: sectionItems(currentFormData?.sections, 'achievements'),
          traits: sectionItems(currentFormData?.sections, 'traits'),
          hobbies: sectionItems(currentFormData?.sections, 'hobbies'),
          awards: sectionItems(currentFormData?.sections, 'awards'),
          volunteering: sectionItems(currentFormData?.sections, 'volunteering'),
          licenses: sectionItems(currentFormData?.sections, 'licenses'),
          custom: sectionItems(currentFormData?.sections, 'custom'),
          profile: currentFormData.sections?.profile || null,
          workExperience: [],
          // Include settings so they persist across sessions
          _settings: {
            selectedTemplate,
            selectedFont,
            fontSize,
            fontSizePixels,
            lineHeight,
            selectedColor,
            headerColor,
            sectionOrder: addedSections,
            sectionNames: sectionNamesMap,
          },
        }
        
        const response = await fetch('/api/save-cv', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            id: cvId,
            user_id: user.id,
            title: cvName || 'Untitled CV',
            data: formattedData,
          }),
        })
        
        const result = await response.json()
        
        // Check for version conflict first (409)
        if (result.conflict || response.status === 409) {
          console.warn('⚠️ Version conflict - updating to latest version from DB')
          // Update version to DB version
          if (result.currentVersion) {
            setCurrentVersion(result.currentVersion)
          }
          return
        }
        
        if (!response.ok) {
          return
        }
        
        if (result.success && result.cv) {
          // Save successful
          setCurrentVersion(result.cv.version)
        }
      } catch (error) {
      }
    } catch (error) {
    } finally {
      setTimeout(() => setIsSavingChanges(false), 1000)
    }
  }, [user, cvId, currentVersion, supabaseClient, form, cvName, selectedTemplate, selectedFont, fontSize, fontSizePixels, lineHeight, selectedColor, headerColor, addedSections])

  // Use debounced autosave
  useDebouncedAutosave(cvData, {
    delay: 800,
    onSave: handleAutosave,
    enabled: hasLoadedInitialData,
  })

  // Stable callback for template selection
  const handleSelectTemplate = useCallback(
    (id: string) => {
      if (onSelectTemplate) {
        onSelectTemplate(id)
      } else {
        setSelectedTemplate(id)
      }
      
      // Set default color for modern template
      if (id === 'modern') {
        setSelectedColor('#2C3E50')
        setHeaderColor('#2C3E50')
      }
      
      // Set default font for minimalist template
      if (id === 'minimalist') {
        setSelectedFont('Inter')
      }
      
      // Set default font for executive template
      if (id === 'executive') {
        setSelectedFont('Georgia')
      }
      
      // Set default font and color for timeline template
      if (id === 'timeline') {
        setSelectedFont('Arial')
        setSelectedColor('#3B82F6')
        setHeaderColor('#3B82F6')
      }
    },
    [onSelectTemplate]
  )

  // Memoize sections to keep reference stable
  const memoizedSections = useMemo(() => staticSectionSections, [staticSectionSections])

  // Uppdatera fontlistan och lägg till Poppins och Inter
  const fonts = [
    "Poppins",
    "Inter",
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Comic Sans MS",
    "Trebuchet MS",
    "Arial Black",
  ]

  // Uppdatera useEffect för att logga när komponenten monteras
  useEffect(() => {}, [])

  const [showPreview, setShowPreview] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const ActionButton = ({ 
    icon: Icon, 
    onClick, 
    disabled = false,
    className = ""
  }: { 
    icon: React.ElementType;
    onClick: (e: React.MouseEvent) => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <div
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onClick(e)
      }}
      className={cn(
        "inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-400",
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  );

  // SortableSection removed - now defined outside component at top of file

  const handleSaveClick = () => {
    // KOMMENTERAT UT: Auth/Stripe-logik för spara
    // if (user) {
    //   if (isSubscribed) {
    //     saveCV()
    //   } else {
    //     setShowCapturePayment(true)
    //   }
    // } else {
    //   setShowSignupPopup(true)
    // }
    
    // DIREKT SPARA (lokalt i browsern)
        saveCV()
  }

  const saveCV = async () => {
    setIsSaving(true)
    try {
      const currentValues = form.getValues()

      // Build data in the same format as autosave for consistency
      const formattedData = {
        skills: currentValues.sections?.skills?.items || currentValues.skills || [],
        password: "",
        projects: [],
        education: currentValues.sections?.education?.items || currentValues.education || [],
        languages: currentValues.sections?.languages?.items || currentValues.languages || [],
        experience: (currentValues.sections?.experience?.items || currentValues.workExperience || []).map((exp: any) => ({
          title: exp.title || "",
          company: exp.company || "",
          current: exp.current || false,
          endDate: exp.endDate || "",
          endYear: exp.endYear || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          startYear: exp.startYear || "",
          description: exp.description || ""
        })),
        references: sectionItems(currentValues?.sections, 'references'),
        personalInfo: {
          ...currentValues.personalInfo,
          email: currentValues.personalInfo?.email || "",
          phone: currentValues.personalInfo?.phone || "",
          title: currentValues.personalInfo?.title || "",
          address: currentValues.personalInfo?.address || "",
          summary: currentValues.personalInfo?.summary || "",
          lastName: currentValues.personalInfo?.lastName || "",
          location: currentValues.personalInfo?.location || "",
          firstName: currentValues.personalInfo?.firstName || "",
          postalCode: currentValues.personalInfo?.postalCode || ""
        },
        certifications: sectionItems(currentValues?.sections, 'certificates'),
        courses: sectionItems(currentValues?.sections, 'courses'),
        internships: sectionItems(currentValues?.sections, 'internship'),
        achievements: sectionItems(currentValues?.sections, 'achievements'),
        traits: sectionItems(currentValues?.sections, 'traits'),
        hobbies: sectionItems(currentValues?.sections, 'hobbies'),
        awards: sectionItems(currentValues?.sections, 'awards'),
        volunteering: sectionItems(currentValues?.sections, 'volunteering'),
        licenses: sectionItems(currentValues?.sections, 'licenses'),
        custom: sectionItems(currentValues?.sections, 'custom'),
        profile: currentValues.sections?.profile || null,
        workExperience: [],
        _settings: {
          selectedTemplate,
          selectedFont,
          fontSize,
          fontSizePixels,
          lineHeight,
          selectedColor,
          headerColor,
          sectionOrder: addedSections,
          sectionNames: sectionNamesMap,
        },
      }

      if (user && user.id) {
        // Save via the same API endpoint as autosave
        const { data: { session } } = await supabaseClient.auth.getSession()
        const accessToken = session?.access_token
        
        const response = await fetch('/api/save-cv', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            id: cvId,
            user_id: user.id,
            title: cvName || 'Untitled CV',
            data: formattedData,
          }),
        })
        
        const result = await response.json()
        
        if (!response.ok) {
          toast({
            title: "Error",
            description: `Failed to save CV: ${result.error || 'Unknown error'}`,
            variant: "destructive",
          })
          return
        }
        
        if (result.success && result.cv) {
          setCurrentVersion(result.cv.version)
        }
      } else {
        // Not logged in - save to localStorage
        saveCVToLocalStorage({
          id: cvId,
          cv_name: cvName,
          selected_template: selectedTemplate,
          selected_font: selectedFont,
          font_size: fontSize === 'XS' ? 9 : fontSize === 'S' ? 10 : fontSize === 'M' ? 11 : fontSize === 'L' ? 12 : 13,
          line_height: parseFloat(lineHeight),
          selected_color: selectedColor,
          header_color: headerColor,
          ...formattedData,
          section_order: addedSections,
          section_names: sectionNamesMap,
        }, cvId || undefined)
      }

      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
      toast({
        title: "Sparat",
        description: "CV:t har sparats.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save CV. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadClick = () => {
    console.log('🔽 Download clicked, user:', user ? 'logged in' : 'not logged in', 'isSubscribed:', isSubscribed)
    if (user) {
      if (isSubscribed) {
        // Användaren har betalat - ladda ner direkt
        console.log('🔽 User has PAID status, downloading PDF...')
        downloadPDF()
      } else {
        // Användaren är inloggad men har inte betalat - visa Stripe checkout
        console.log('🔽 Opening payment popup...')
        setShowCapturePayment(true)
      }
    } else {
      // Användaren är inte inloggad - visa signup popup
      console.log('🔽 Opening signup popup...')
      setShowSignupPopup(true)
    }
  }

  const downloadPDF = async () => {
    setIsDownloading(true)
    try {

      const currentValues = form.getValues()
      
      console.log('📋 Form values:', {
        hasPersonalInfo: !!currentValues.personalInfo,
        hasSections: !!currentValues.sections,
        sectionsKeys: currentValues.sections ? Object.keys(currentValues.sections) : [],
        experienceItems: currentValues.sections?.experience?.items?.length || 0,
        workExperience: currentValues.workExperience?.length || 0,
      })

      // Get visible sections
      const visibleSections = addedSections.filter((sectionId) => {
        const section = staticSectionSections.find((s) => s.id === sectionId) || 
                       optionalSections.find((s) => s.id === sectionId)
        return section && !(section as any).hidden
      })

      // Transform form data to CV data format (same as preview)
      const pdfData = {
        personalInfo: currentValues.personalInfo || {},
        workExperience: currentValues.sections?.experience?.items || currentValues.workExperience || [],
        education: currentValues.sections?.education?.items || currentValues.education || [],
        skills: currentValues.sections?.skills?.items || currentValues.skills || [],
        languages: currentValues.sections?.languages?.items || currentValues.languages || [],
        sections: {
          profile: currentValues.sections?.profile,
          courses: sectionItems(currentValues?.sections, 'courses'),
          internship: sectionItems(currentValues?.sections, 'internship'),
          certificates: sectionItems(currentValues?.sections, 'certificates'),
          achievements: sectionItems(currentValues?.sections, 'achievements'),
          references: sectionItems(currentValues?.sections, 'references'),
          traits: sectionItems(currentValues?.sections, 'traits'),
          hobbies: sectionItems(currentValues?.sections, 'hobbies'),
          awards: sectionItems(currentValues?.sections, 'awards'),
          volunteering: sectionItems(currentValues?.sections, 'volunteering'),
          licenses: sectionItems(currentValues?.sections, 'licenses'),
          custom: sectionItems(currentValues?.sections, 'custom'),
        }
      }
      
      console.log('📄 PDF Data:', {
        workExperience: pdfData.workExperience?.length,
        education: pdfData.education?.length,
        skills: pdfData.skills?.length,
        sectionOrder: visibleSections,
      })

      // Call Puppeteer API to generate PDF
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: pdfData,
          sectionOrder: visibleSections,
          sections: [...staticSectionSections, ...optionalSections],
          headerColor: headerColor,
          selectedFont: selectedFont,
          fontSize: fontSize,
          textColor: selectedColor,
          lineHeight: lineHeight,
          selectedTemplate: selectedTemplate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      // Get PDF blob from response
      const blob = await response.blob()

      // Download the PDF
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = cvName || 'cv.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)


      toast({
        title: "Success!",
        description: `CV har laddats ner som PDF.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Uppdatera availableOptionalSections för att inkludera både valfria och borttagna grundläggande sektioner
  const availableOptionalSections = useMemo(() => {
    // Hämta alla borttagna grundläggande sektioner (inkluderar dolda sektioner)
    const removedBasicSections = basicSections
      .filter(id => {
        const section = staticSectionSections.find(s => s.id === id)
        // Inkludera om sektionen är dold
        return section?.hidden === true
      })
      .map(id => {
        const section = staticSectionSections.find(s => s.id === id)
        return section ? {
          id: section.id,
          title: section.title,
          component: section.component,
          isBasic: true
        } : null
      })
      .filter(Boolean)

    // Hämta alla tillgängliga valfria sektioner
    const availableOptional = optionalSections.filter(
      section => !addedSections.includes(section.id)
    )

    // Lägg till sektioner som har data men inte är tillagda
    const sectionsWithData = Object.entries(watchedSections || {})
      .filter(([key, value]) => {
        // Exkludera sektioner som redan är tillagda
        if (addedSections.includes(key)) {
          return false
        }
        if (Array.isArray(value)) {
          return value.length > 0
        } else if (typeof value === 'object' && value !== null) {
          return Object.keys(value).length > 0
        }
        return false
      })
      .map(([key]) => {
        const section = optionalSections.find(s => s.id === key)
        return section ? {
          id: section.id,
          title: section.title,
          component: section.component,
          hasData: true
        } : null
      })
      .filter(Boolean)

    // Kombinera alla sektioner och ta bort duplikater baserat på id
    const allSections = [...removedBasicSections, ...availableOptional, ...sectionsWithData]
    const uniqueSections = allSections.reduce((acc: any[], current: any) => {
      const exists = acc.find(item => item.id === current.id)
      if (!exists) {
        acc.push(current)
      }
      return acc
    }, [])

    return uniqueSections
  }, [addedSections, basicSections, staticSectionSections, optionalSections, watchedSections])

  // Removed automatic section adding to prevent infinite loops
  // useEffect(() => {
  //   const sectionsWithData = Object.entries(formData.sections || {})...
  // }, [formData.sections, addedSections])

  const handleAddSection = (sectionId: string) => {
    
    // Kolla om det är en grundläggande sektion som är dold
    const existingSection = staticSectionSections.find(s => s.id === sectionId)
    
    if (existingSection?.hidden) {
      // Om sektionen är dold, visa den igen
      setStaticSectionSections(prev => 
        prev.map(section => 
          section.id === sectionId ? { ...section, hidden: false } : section
        )
      )
      // Öppna sektionen
      setOpenSections(prev => [...prev, sectionId])
    } else if (!addedSections.includes(sectionId)) {
      
      // Kolla om det är en grundläggande sektion
      if (basicSections.includes(sectionId)) {
        setAddedSections(prev => [...prev, sectionId])
        setStaticSectionSections(prev => 
          prev.map(section => 
            section.id === sectionId ? { ...section, hidden: false } : section
          )
        )
        // Öppna sektionen
        setOpenSections(prev => [...prev, sectionId])
      } else {
        // Hantera valfri sektion
        const sectionToAdd = optionalSections.find(section => section.id === sectionId)
        if (sectionToAdd) {
          
          // Special handling for 'profile' - insert after personalInfo (position 1)
          if (sectionId === 'profile') {
            setStaticSectionSections(prev => {
              const newSection = {
                id: sectionToAdd.id,
                title: sectionToAdd.title,
                component: sectionToAdd.component,
                removable: true,
                hidden: false
              }
              // Insert at position 1 (after personalInfo)
              return [
                prev[0], // personalInfo
                newSection, // profile
                ...prev.slice(1) // rest of sections
              ]
            })
            setAddedSections(prev => {
              // Insert at position 1
              return [
                prev[0], // personalInfo
                sectionId, // profile
                ...prev.slice(1) // rest of sections
              ]
            })
          } else {
            // For other sections, add at the end
            setStaticSectionSections(prev => [
              ...prev,
              {
                id: sectionToAdd.id,
                title: sectionToAdd.title,
                component: sectionToAdd.component,
                removable: true,
                hidden: false
              }
            ])
            setAddedSections(prev => [...prev, sectionId])
          }
          
          // Öppna sektionen
          setOpenSections(prev => [...prev, sectionId])
        }
      }
    }
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 grid grid-cols-3 items-center">
          <div className="flex justify-start items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center shrink-0" aria-label="Till startsidan">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cvfixaren-ebeQXxOTCrb79kvOYjGEuecJeiitvr.png"
                alt="CVfixaren"
                width={150}
                height={50}
                className="h-7 w-auto"
                priority
              />
            </Link>
            <button
              onClick={() => router.push('/profil')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-sm font-medium px-3 py-2 rounded-md border border-gray-200 transition-colors"
              style={{ outline: 'none', background: 'none' }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Mina CV</span>
            </button>
          </div>
          
          {/* Editable CV Name */}
          <div className="flex justify-center items-center gap-2">
            <div style={{ width: '16px', height: '16px', flexShrink: 0 }}>
              {isSavingChanges ? (
                <Save className="h-4 w-4 text-gray-400 animate-pulse" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-[#00bf63]" />
              )}
            </div>
            <div style={{ 
              position: 'relative', 
              display: 'inline-block', 
              width: `${Math.max(80, cvName.length * 8.5 + 16)}px`,
              maxWidth: '300px',
              transition: 'width 0.2s'
            }}>
              {isEditingName ? (
                <>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    onBlur={() => {
                      setIsEditingName(false)
                      if (cvName.trim() === "") setCvName("cv.pdf")
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingName(false)
                        if (cvName.trim() === "") setCvName("cv.pdf")
                      }
                    }}
                    className="bg-transparent text-gray-900 text-base font-medium text-center outline-none px-2 py-1"
                    style={{ 
                      border: 'none',
                      width: '100%'
                    }}
                    autoFocus
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      height: '2px',
                      backgroundColor: '#00bf63',
                      width: `${Math.max(60, cvName.length * 8.5 + 8)}px`,
                      maxWidth: '280px',
                      transition: 'width 0.2s'
                    }}
                  />
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsEditingName(true)
                    setTimeout(() => nameInputRef.current?.focus(), 0)
                  }}
                  className="text-gray-900 text-base font-medium hover:text-[#00bf63] transition-colors px-2"
                  style={{ border: 'none', outline: 'none', background: 'none', width: '100%', textAlign: 'center' }}
                >
                  {cvName}
                </button>
              )}
            </div>
          </div>
          
          <div className="flex justify-end items-center gap-3">
            {user && pathname !== "/profil/skapa-cv" && (
              <button
                className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                style={{ outline: 'none', background: 'none' }}
              >
                Logga ut
              </button>
            )}
            <button
              className="btn-sweep-glow bg-[#00bf63] text-white px-4 py-2 rounded-md hover:bg-[#00a857] transition-colors font-medium text-sm flex items-center gap-2"
              onClick={handleDownloadClick}
              disabled={isDownloading}
              style={{ border: 'none', outline: 'none' }}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Laddar..." : "Ladda ned"}
            </button>
          </div>
        </header>

        {/* Success message */}
        {showSuccessMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in flex items-center gap-2">
            <Check className="h-5 w-5" />
            <span className="font-medium">CV sparades framgångsrikt!</span>
          </div>
        )}
        
      <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: '#16233a' }}>

        {/* Left side - Form */}
        <div
          ref={formContainerRef}
          className={`w-full px-5 py-6 sm:px-7 bg-white overflow-y-auto transition-all duration-300 ease-in-out h-full relative z-10 ${isFullscreen ? 'sm:w-0 sm:opacity-0 sm:overflow-hidden sm:p-0' : 'sm:w-1/2 xl:w-[38%] xl:min-w-[576px] xl:shrink-0 2xl:w-[35%] 2xl:max-w-[720px] sm:opacity-100'}`}
          style={{ boxShadow: '10px 0 30px -14px rgba(8, 15, 30, 0.55)' }}
        >
          <div className="max-w-2xl mx-auto">
            {/* Completeness meter */}
            <div className="mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Färdigställt</span>
                <span className="text-sm font-semibold text-[#00bf63] tabular-nums">
                  {cvProgress.percent} %
                </span>
              </div>
              <div
                className="h-2 w-full rounded-full bg-gray-100 overflow-hidden"
                role="progressbar"
                aria-valuenow={cvProgress.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Hur färdigt ditt CV är"
              >
                <div
                  className="h-full rounded-full bg-[#00bf63] transition-[width] duration-500 ease-out"
                  style={{ width: `${cvProgress.percent}%` }}
                />
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-gray-500">{progressMessage}</p>
            </div>

            {/* Main sections */}
            {!isMounted ? (
              // Server-side fallback: render sections without DnD
              <div>
                {addedSections.map((id) => {
              const section = staticSectionSections.find((s) => s.id === id)
                  const isOpen = openSections.includes(id)
              if (!section) return null
              // Don't render hidden sections
              if (section.hidden) return null
              // Sections that support page breaks (have items)
              const supportsPageBreaks = ['experience', 'education', 'courses', 'internship', 'certificates', 'achievements', 'references', 'awards', 'volunteering', 'licenses', 'custom'].includes(id)
              return (
                    <div key={id} className={`${isOpen ? 'bg-white rounded-xl ring-1 ring-gray-200 shadow-sm my-3' : 'border-b border-gray-100'} transition-all`}>
                      <div className={`${section.hidden ? "opacity-50" : ""} transition-all`}>
                        <div
                          className={`flex w-full items-start justify-between gap-2 py-4 group transition-colors duration-200 cursor-pointer rounded-xl ${isOpen ? 'px-4' : 'px-2 hover:bg-gray-50'}`}
                          onClick={() => toggleSection(id)}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <GripVertical className="h-5 w-5 shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 active:text-[#00bf63] transition-colors" />
                            <div className="min-w-0">
                              <span className={`font-medium text-base transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                {section.title}
                              </span>
                              {isOpen && SECTION_HINTS[id] && (
                                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                                  {SECTION_HINTS[id]}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                        {section.removable && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    className={`inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer mr-2 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                  {supportsPageBreaks && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        handleAddPageBreak(id)
                                      }}
                                    >
                                      <AlignJustify className="h-4 w-4 mr-2" />
                                      Lägg till sidbrytning
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      handleRemoveSection(id)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Ta bort
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            <div>
                              {isOpen ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                      </div>
                  </div>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="px-4 pb-5 space-y-3">
                      {section.id === "personalInfo" && <PersonalInfo />}
                      {section.id === "experience" && <Experience />}
                      {section.id === "education" && <Education />}
                      {section.id === "skills" && <Skills />}
                      {section.id === "languages" && <Languages />}
                      {section.id === "courses" && <Courses />}
                      {section.id === "internship" && <Internship />}
                      {section.id === "profile" && <Profile />}
                  {section.id === "hobbies" && <Hobbies />}
                      {section.id === "references" && <References />}
                      {section.id === "traits" && <Traits />}
                      {section.id === "certificates" && <Certificates />}
                      {section.id === "achievements" && <Achievements />}
                      {section.id === "awards" && <Awards />}
                      {section.id === "volunteering" && <Volunteering />}
                      {section.id === "licenses" && <Licenses />}
                      {section.id === "custom" && <CustomSection />}
                    </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              // Client-side: render with DnD
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={addedSections} strategy={verticalListSortingStrategy}>
                  {addedSections.map((id) => {
                    // Find section in either staticSectionSections or optionalSections
                    const section = staticSectionSections.find((s) => s.id === id) || 
                                   optionalSections.find((s) => s.id === id)
                    
                    // Skip if section not found
                    if (!section) {
                      console.warn('Section not found for id:', id)
                      return null
                    }
                    
                    return (
                      <SortableItem
                        key={id}
                        id={id}
                        section={section}
                        isOpen={openSections.includes(id)}
                        onToggle={toggleSection}
                        onRemove={handleRemoveSection}
                        onAddPageBreak={handleAddPageBreak}
                        onRename={handleRenameSection}
                      />
                    )
                  })}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div className="bg-white ring-1 ring-gray-200 shadow-xl rounded-xl">
                      <div className="flex w-full items-center justify-between py-4 px-4">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-5 w-5 text-[#00bf63]" />
                          <span className="font-medium text-base text-gray-900">
                            {staticSectionSections.find((s) => s.id === activeId)?.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}

            {/* Available sections to add - collapsed behind a single button */}
            <div className="mt-6" ref={moreFieldsDropdownRef}>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-dashed border-gray-300 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMoreFieldsMenu(!showMoreFieldsMenu)
                  }}
                >
                  <Plus className="h-4 w-4 text-[#00bf63]" />
                  <span>Visa fler fält</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showMoreFieldsMenu ? "rotate-180" : ""}`} />
                </button>

                {showMoreFieldsMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 max-h-80 overflow-y-auto">
                    {availableOptionalSections.filter(Boolean).length === 0 ? (
                      <p className="px-3 py-3 text-sm text-gray-500 text-center">Alla fält är redan tillagda</p>
                    ) : (
                      availableOptionalSections.filter(Boolean).map((section: any) => (
                        <button
                          key={section.id}
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors text-left"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddSection(section.id)
                            setShowMoreFieldsMenu(false)
                          }}
                        >
                          <Plus className="h-4 w-4 text-[#00bf63] shrink-0" />
                          <span className="text-sm text-gray-800">{section.title}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Download button at bottom of form */}
            <div className="mt-8 pt-4 border-t border-gray-200 pb-20 md:pb-8">
              <button
                className="btn-sweep-glow w-full bg-[#00bf63] hover:bg-[#00a857] text-white flex items-center justify-center gap-2 py-3 rounded-md transition-all font-medium text-base"
                style={{ 
                  border: '0px solid transparent', 
                  outline: '0px solid transparent', 
                  boxShadow: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
                onClick={handleDownloadClick}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4" />
                {isDownloading ? "Laddar..." : "Ladda ned"}
              </button>
            </div>

          </div>
        </div>

        {/* Right side - Preview */}
        <div
          className={`hidden sm:flex w-full overflow-hidden flex-col transition-all duration-300 ease-in-out ${isFullscreen ? 'sm:w-full' : 'sm:w-1/2 xl:w-auto xl:flex-1'}`}
          style={{ backgroundColor: '#16233a', boxShadow: 'inset 26px 0 34px -26px rgba(0, 0, 0, 0.7)' }}
        >
          {/* Preview Header */}
        
          
          <div 
            className={`hidden sm:flex w-full h-full flex-grow overflow-hidden relative group ${zoomLevel > 1.0 ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={(e) => {
              if (zoomLevel > 1.0) {
                setZoomLevel(1.0)
              } else {
                setZoomLevel(1.3)
              }
            }}
          >
              {/* Zoom icon on hover */}
              <div className="absolute top-4 right-4 bg-white/10 ring-1 ring-white/20 backdrop-blur-md rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {zoomLevel > 1.0 ? (
                  <ZoomOut className="h-6 w-6 text-white" />
                ) : (
                  <ZoomIn className="h-6 w-6 text-white" />
                )}
              </div>
              
              <PreviewBridge
                form={form}
                selectedTemplate={selectedTemplate}
                selectedFont={selectedFont}
                fontSizePixels={fontSizePixels}
                lineHeight={lineHeight}
                selectedColor={selectedColor}
                headerColor={headerColor}
                zoomLevel={zoomLevel}
                sectionOrder={addedSections}
                sections={memoizedSections}
                templates={templates}
                onSelectTemplate={handleSelectTemplate}
              />
          </div>
          {/* Preview controls */}
          <div className="w-full px-4 py-3 border-t border-white/10" style={{ backgroundColor: '#111b2e' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative" ref={templateDropdownRef}>
                  <button
                    className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowTemplateMenu(!showTemplateMenu)
                    }}
                  >
                    <LayoutIcon className="h-4 w-4" />
                    <span className="text-sm">Mall</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showTemplateMenu ? "rotate-180" : ""}`} />
                  </button>

                  {showTemplateMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-[900px] bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-[999]">
                      <h3 className="text-xs font-semibold text-gray-700 mb-3">Välj en mall</h3>
                      <div className="overflow-x-auto pb-2">
                        <div className="flex gap-3 min-w-max">
                        {templates
                          .filter((template) => ["default", "modern", "minimalist", "executive", "timeline"].includes(template.id))
                          .map((template) => (
                            <button
                              key={template.id}
                              className={`group relative flex flex-col items-center p-2 rounded-lg border-2 transition-all hover:shadow-md flex-shrink-0 ${
                                selectedTemplate === template.id 
                                  ? 'border-[#00bf63] bg-green-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectTemplate(template.id)
                                setShowTemplateMenu(false)
                              }}
                            >
                              {/* Preview thumbnail */}
                              <div className="w-40 h-32 bg-gray-50 rounded border border-gray-200 mb-2 overflow-hidden p-2">
                                {template.id === 'default' && (
                                  <div className="space-y-1 text-[6px]">
                                    <div className="flex items-start gap-1 pb-1 border-b border-black">
                                      <div className="flex-1">
                                        <div className="font-bold text-[7px]">Anna Andersson</div>
                                        <div className="text-gray-600 text-[5px]">Senior Projektledare</div>
                                        <div className="text-gray-500 text-[4px] mt-0.5">anna@email.se • 070-123 45 67</div>
                                      </div>
                                      <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                                    </div>
                                    <div>
                                      <div className="font-bold text-[5px] uppercase border-b border-gray-300 pb-0.5 mb-0.5">Yrkeslivserfarenhet</div>
                                      <div className="text-[5px] space-y-0.5">
                                        <div>
                                          <div className="font-semibold">Projektledare</div>
                                          <div className="text-gray-600">Tech AB • 2020 - Nu</div>
                                        </div>
                                        <div>
                                          <div className="font-semibold">Utvecklare</div>
                                          <div className="text-gray-600">IT Consulting • 2018 - 2020</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-bold text-[5px] uppercase border-b border-gray-300 pb-0.5 mb-0.5">Utbildning</div>
                                      <div className="text-[5px]">
                                        <div className="font-semibold">Civilingenjör</div>
                                        <div className="text-gray-600">KTH • 2014 - 2018</div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {template.id === 'modern' && (
                                  <div className="flex h-full gap-0.5">
                                    <div className="w-1/3 bg-[#2C3E50] text-white p-1 rounded-l space-y-0.5">
                                      <div className="w-4 h-4 rounded-full bg-white/20 mx-auto"></div>
                                      <div className="text-center text-[5px] font-bold">Erik Berg</div>
                                      <div className="text-center text-[4px] text-white/80">UX Designer</div>
                                      <div className="text-[4px] space-y-0.5 mt-1">
                                        <div className="font-semibold text-[4px]">KONTAKT</div>
                                        <div className="text-white/90 text-[3px]">erik@email.se</div>
                                        <div className="text-white/90 text-[3px]">070-987 65 43</div>
                                      </div>
                                      <div className="text-[4px] space-y-0.5 mt-1">
                                        <div className="font-semibold text-[4px]">FÄRDIGHETER</div>
                                        <div className="text-white/90 text-[3px]">• Figma</div>
                                        <div className="text-white/90 text-[3px]">• Adobe XD</div>
                                        <div className="text-white/90 text-[3px]">• Sketch</div>
                                      </div>
                                    </div>
                                    <div className="flex-1 p-1 space-y-1">
                                      <div>
                                        <div className="font-bold text-[4px] uppercase border-b border-gray-300 pb-0.5 mb-0.5">Yrkeslivserfarenhet</div>
                                        <div className="text-[4px] space-y-0.5">
                                          <div>
                                            <div className="font-semibold">Senior UX Designer</div>
                                            <div className="text-gray-600">Design Studio • 2021 - Nu</div>
                                          </div>
                                          <div>
                                            <div className="font-semibold">UX Designer</div>
                                            <div className="text-gray-600">StartUp AB • 2019 - 2021</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-bold text-[4px] uppercase border-b border-gray-300 pb-0.5 mb-0.5">Utbildning</div>
                                        <div className="text-[4px]">
                                          <div className="font-semibold">Interaktionsdesign</div>
                                          <div className="text-gray-600">Malmö Universitet</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {template.id === 'minimalist' && (
                                  <div className="space-y-1 text-center text-[6px]">
                                    <div className="w-5 h-5 rounded-full bg-gray-300 mx-auto"></div>
                                    <div className="font-bold text-[7px]">Sofia Lindström</div>
                                    <div className="text-gray-600 text-[5px]">Marketing Manager</div>
                                    <div className="text-gray-500 text-[4px]">sofia@email.se • Stockholm</div>
                                    <div className="border-t border-gray-200 pt-1 mt-1 text-left space-y-1">
                                      <div>
                                        <div className="font-bold text-[5px] uppercase text-gray-400 mb-0.5">Yrkeslivserfarenhet</div>
                                        <div className="text-[5px] space-y-0.5">
                                          <div>
                                            <div className="font-semibold">Marketing Manager</div>
                                            <div className="text-gray-600">Brand Co • 2020 - Nu</div>
                                          </div>
                                          <div>
                                            <div className="font-semibold">Marketing Specialist</div>
                                            <div className="text-gray-600">Media Group • 2017 - 2020</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-bold text-[5px] uppercase text-gray-400 mb-0.5">Utbildning</div>
                                        <div className="text-[5px]">
                                          <div className="font-semibold">Marknadsföring</div>
                                          <div className="text-gray-600">Stockholms Universitet</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {template.id === 'executive' && (
                                  <div className="space-y-1 text-[6px]">
                                    <div className="flex items-center gap-1 pb-1 border-b-2 border-gray-800">
                                      <div className="w-6 h-6 rounded-full bg-gray-300 border border-gray-800"></div>
                                      <div className="flex-1">
                                        <div className="font-bold text-[7px]">Michael Karlsson</div>
                                        <div className="text-gray-600 text-[5px]">CEO & Founder</div>
                                      </div>
                                    </div>
                                    <div className="text-gray-500 text-[4px]">michael@email.se • +46 70 123 45 67</div>
                                    <div className="space-y-1">
                                      <div>
                                        <div className="font-bold text-[5px] uppercase text-gray-800 border-b-2 border-gray-800 pb-0.5 mb-0.5">Yrkeslivserfarenhet</div>
                                        <div className="text-[5px] space-y-0.5">
                                          <div>
                                            <div className="font-semibold">CEO & Founder</div>
                                            <div className="text-gray-600">Innovation Labs • 2018 - Nu</div>
                                          </div>
                                          <div>
                                            <div className="font-semibold">Director of Operations</div>
                                            <div className="text-gray-600">Tech Corp • 2015 - 2018</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-bold text-[5px] uppercase text-gray-800 border-b-2 border-gray-800 pb-0.5 mb-0.5">Utbildning</div>
                                        <div className="text-[5px]">
                                          <div className="font-semibold">MBA</div>
                                          <div className="text-gray-600">Stockholm School of Economics</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {template.id === 'timeline' && (
                                  <div className="space-y-1 text-[6px]">
                                    <div className="flex items-center gap-1 pb-1 border-b border-gray-200">
                                      <div className="w-5 h-5 rounded-full bg-gray-300 border border-blue-500"></div>
                                      <div className="flex-1">
                                        <div className="font-bold text-[7px]">Lisa Johansson</div>
                                        <div className="text-gray-600 text-[5px]">Data Scientist</div>
                                      </div>
                                    </div>
                                    <div className="text-gray-500 text-[4px]">lisa@email.se • Göteborg</div>
                                    <div>
                                      <div className="font-bold text-[5px] uppercase text-blue-500 mb-0.5">Yrkeslivserfarenhet</div>
                                      <div className="relative pl-2 border-l-2 border-blue-500 space-y-1">
                                        <div className="relative">
                                          <div className="absolute -left-[5px] top-0 w-1.5 h-1.5 rounded-full bg-blue-500 border border-white"></div>
                                          <div className="text-[5px]">
                                            <div className="text-blue-500 font-semibold text-[4px]">2021 - Nu</div>
                                            <div className="font-semibold">Senior Data Scientist</div>
                                            <div className="text-gray-600">AI Solutions AB</div>
                                          </div>
                                        </div>
                                        <div className="relative">
                                          <div className="absolute -left-[5px] top-0 w-1.5 h-1.5 rounded-full bg-blue-500 border border-white"></div>
                                          <div className="text-[5px]">
                                            <div className="text-blue-500 font-semibold text-[4px]">2018 - 2021</div>
                                            <div className="font-semibold">Data Analyst</div>
                                            <div className="text-gray-600">Tech Insights</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-bold text-[5px] uppercase text-blue-500 mb-0.5">Utbildning</div>
                                      <div className="text-[5px]">
                                        <div className="font-semibold">MSc Computer Science</div>
                                        <div className="text-gray-600">Chalmers • 2016 - 2018</div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Template name */}
                              <div className="text-center w-full">
                                <div className="font-semibold text-[11px] text-gray-900">{template.name}</div>
                              </div>
                              
                              {/* Selected indicator */}
                              {selectedTemplate === template.id && (
                                <div className="absolute top-1 right-1 bg-[#00bf63] rounded-full p-0.5">
                                  <Check className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 flex-1">
                {/* Font selector */}
                <div className="relative" ref={fontDropdownRef}>
                  <button
                    className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowFontMenu(!showFontMenu)
                    }}
                  >
                    <Type className="h-4 w-4" />
                    <span className="text-sm">{selectedFont}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showFontMenu ? "rotate-180" : ""}`} />
                  </button>

                  {showFontMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 space-y-1 z-[999] max-h-64 overflow-y-auto">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200 mb-1">
                        Typsnitt
                      </div>
                      {fonts.map((font) => (
                        <button
                          key={font}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                            selectedFont === font ? "bg-gray-100" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFont(font)
                            setShowFontMenu(false)
                          }}
                          style={{ fontFamily: font }}
                        >
                          <span className="text-sm">{font}</span>
                          {selectedFont === font && <Check className="h-4 w-4 text-green-500 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Font size selector */}
                <div className="relative" ref={fontSizeDropdownRef}>
                  <button
                    className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium"
                    onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
                  >
                    <TextSize className="h-4 w-4" />
                    <span className="text-sm">{fontSize}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showFontSizeMenu ? "rotate-180" : ""}`} />
                  </button>

                  {showFontSizeMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 space-y-1 z-[999]">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200 mb-1">
                        Textstorlek
                      </div>
                      {["XS", "S", "M", "L", "XL"].map((size) => (
                        <button
                          key={size}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                            fontSize === size ? "bg-gray-100" : ""
                          }`}
                          onClick={() => handleFontSizeChange(size)}
                        >
                          <span className="text-sm">{size}</span>
                          {fontSize === size && <Check className="h-4 w-4 text-green-500 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Line height selector */}
                <div className="relative" ref={lineHeightDropdownRef}>
                  <button
                    className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium"
                    onClick={() => setShowLineHeightMenu(!showLineHeightMenu)}
                  >
                    <List className="h-4 w-4" />
                    <span className="text-sm">{lineHeight}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showLineHeightMenu ? "rotate-180" : ""}`} />
                  </button>

                  {showLineHeightMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 space-y-1 z-[999]">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-600 border-b border-gray-200 mb-1">
                        Radavstånd
                      </div>
                      {["1.0", "1.15", "1.5", "1.75", "2.0"].map((height) => (
                        <button
                          key={height}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                            lineHeight === height ? "bg-gray-100" : ""
                          }`}
                          onClick={() => handleLineHeightChange(height)}
                        >
                          <span className="text-sm">{height}</span>
                          {lineHeight === height && <Check className="h-4 w-4 text-green-500 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Color picker */}
                <div className="relative" ref={colorPickerRef}>
                  <button
                    className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium"
                    onClick={toggleColorPicker}
                  >
                    <Palette className="h-4 w-4" />
                    <span className="text-sm">Färg</span>
                    <div className="w-6 h-6 rounded-md ring-2 ring-white/70 shadow-sm" style={{ backgroundColor: selectedColor }} />
                  </button>
                  {isColorPickerOpen && (
                    <div className="absolute bottom-full right-0 mb-2 p-4 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] w-72">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Välj färg</h4>
                      <div className="grid grid-cols-6 gap-2 mb-4">
                        {["#000000", "#4A5568", "#2B6CB0", "#48BB78", "#9F7AEA", "#ED8936", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"].map((color) => (
                          <button
                            key={color}
                            className={`w-10 h-10 rounded-lg border-2 hover:scale-110 transition-transform ${selectedColor === color ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900' : 'border-gray-200'}`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorChange(color)}
                          />
                        ))}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">Egen färg</label>
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                          className="w-full h-12 cursor-pointer rounded-lg border-2 border-gray-200"
                      />
                        <div className="mt-2 text-xs font-mono text-center bg-gray-100 py-2 rounded-lg">{selectedColor}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Fullscreen toggle */}
                <button
                  className="flex items-center justify-center text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent
          className="bg-gray-100 flex flex-col overflow-visible max-w-[none] transform scale-[0.4] md:scale-100 origin-center"
          style={{ minWidth: "950px", minHeight: "1300px" }}
        >
          <div className="bg-white p-8">
            <PreviewBridge
              form={form}
              selectedTemplate={selectedTemplate}
              selectedFont={selectedFont}
              fontSizePixels={fontSizePixels}
              lineHeight={lineHeight}
              selectedColor={selectedColor}
              headerColor={headerColor}
              zoomLevel={zoomLevel}
              sectionOrder={addedSections}
              sections={memoizedSections}
              templates={templates}
              onSelectTemplate={handleSelectTemplate}
            />
            <div className="bg-white border-t w-full p-3.5">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center">
                  <div className="relative" ref={templateDropdownRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowTemplateMenu(!showTemplateMenu)
                      }}
                    >
                      <LayoutIcon className="h-4 w-4" />
                      <span className="text-sm">Mall</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showTemplateMenu ? "rotate-180" : ""}`} />
                    </button>

                    {showTemplateMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border p-2 space-y-1 z-999">
                        {templates
                          .filter((template) => ["default"].includes(template.id))
                          .map((template) => (
                            <button
                              key={template.id}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectTemplate(template.id)
                                setShowTemplateMenu(false)
                              }}
                            >
                              <span className="text-sm">{template.name}</span>
                              {selectedTemplate === template.id && <Check className="h-4 w-4 text-green-500 ml-auto" />}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              className="fixed top-4 right-4 flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg bg-white hover:bg-gray-100 transition-colors font-medium shadow-lg"
              onClick={() => setShowPreview(false)}
            >
              <Minimize2 className="h-4 w-4" />
              <span className="text-sm">Minimera</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <DownloadPopup 
        isOpen={isDownloadPopupOpen} 
        onClose={() => setIsDownloadPopupOpen(false)} 
        onDownload={downloadPDF}
      />

      {/* Add payment and signup popups */}
      {showCapturePayment && (
        <CapturePayment 
          isOpen={showCapturePayment}
          onClose={() => setShowCapturePayment(false)}
          onPaymentSuccess={() => {
            setShowCapturePayment(false)
            setIsSubscribed(true)
            downloadPDF()
          }}
        />
      )}
      {showSignupPopup && (
        <SignupPopup 
          isOpen={showSignupPopup}
          onClose={() => setShowSignupPopup(false)}
          onOpenLogin={() => {
            setShowSignupPopup(false)
            setShowLoginPopup(true)
          }}
          onSignupSuccess={() => {
            setShowSignupPopup(false)
            setShowCapturePayment(true)
          }}
        />
      )}
      {showLoginPopup && (
        <LoginPopup
          isOpen={showLoginPopup}
          onClose={() => setShowLoginPopup(false)}
          onOpenSignup={() => {
            setShowLoginPopup(false)
            setShowSignupPopup(true)
          }}
        />
      )}

      </div>
    </FormProvider>
  )
})

ResumeEditor.displayName = 'ResumeEditor'

export default ResumeEditor
