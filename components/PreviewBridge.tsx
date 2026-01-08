"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { useWatch } from "react-hook-form"
import { ResumePreview } from "./resume-preview"

function shallowArrayEqual(a: any[], b: any[]) {
  if (a === b) return true
  if (!a || !b || a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

interface PreviewBridgeProps {
  form: any
  selectedTemplate: string
  selectedFont: string
  fontSizePixels: string
  lineHeight: string
  selectedColor: string
  headerColor: string
  sectionOrder: string[]
  sections: any[]
  templates: any[]
  zoomLevel: number
  onSelectTemplate: (id: string) => void
}

function PreviewBridge(props: PreviewBridgeProps) {
  const {
    form,
    sectionOrder,
    sections,
    templates,
    selectedTemplate,
    selectedFont,
    fontSizePixels,
    lineHeight,
    selectedColor,
    headerColor,
    zoomLevel,
    onSelectTemplate,
  } = props

  // Subscribe to form fields via useWatch
  const formData = useWatch({ control: form.control })
  
  // State for debounced data
  const [debouncedData, setDebouncedData] = useState<any>({
    personalInfo: {},
    workExperience: [],
    education: [],
    skills: [],
    languages: [],
    sections: {},
    experience: [],
  })
  
  // Persistent UID map - survives re-renders
  const uidMapRef = useRef(new WeakMap<object, string>())
  
  // Stable UID generator - persists across re-renders
  const getStableUid = useCallback((obj: any, ns: string) => {
    if (!obj || typeof obj !== 'object') return `${ns}:prim:${String(obj)}`
    if (obj.id) return obj.id          // from useFieldArray
    if (obj.__uid) return obj.__uid    // our persisted uid
    
    // Check WeakMap first
    const existingUid = uidMapRef.current.get(obj)
    if (existingUid) return existingUid
    
    // Generate permanent uid
    const uid = `${ns}:${(crypto?.randomUUID?.() || Math.random().toString(36).slice(2))}`
    
    // Store in WeakMap
    uidMapRef.current.set(obj, uid)
    
    // Also try to persist on object (non-enumerable so it doesn't show in JSON/forms)
    try {
      Object.defineProperty(obj, '__uid', { value: uid, enumerable: false, configurable: false })
    } catch {
      // Fallback if object is frozen/sealed
      try {
        obj.__uid = uid
      } catch {
        // Object is completely immutable, WeakMap will handle it
      }
    }
    
    return uid
  }, [])
  
  // Debounce effect - wait 1 second after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      // Helper to check if an object has any meaningful content
      const hasContent = (item: any) => {
        if (!item || typeof item !== 'object') return false
        // Ignore metadata fields from useFieldArray
        const ignoredKeys = ['id', '__typename']
        const relevantEntries = Object.entries(item).filter(([key]) => !ignoredKeys.includes(key))
        
        return relevantEntries.some(([key, value]) => {
          if (typeof value === 'string') return value.trim() !== ''
          if (typeof value === 'boolean') return value === true // Only count true, not false
          if (Array.isArray(value)) return value.length > 0
          return value != null && value !== ''
        })
      }
      
      // Helper to ensure all items have stable UIDs (not content-based)
      // UIDs are permanent and don't change when content changes
      const ensureKeys = (arr: any[], ns: string) =>
        (arr || []).map((x) => {
          if (!x) return x
          // If already has id or __uid, keep it
          if (x.id || x.__uid) return x
          // Generate permanent uid and persist it
          const uid = getStableUid(x, ns)
          return { ...x, __uid: uid }
        })
      
      // Ensure keys but DON'T filter - keep array structure intact
      // Template will render null for empty items, maintaining stable indices
      // Read from sections first (new structure), fallback to old structure
      const cleanWorkExperience = ensureKeys(formData?.sections?.experience?.items || formData?.workExperience || [], 'work')
      const cleanEducation = ensureKeys(formData?.sections?.education?.items || formData?.education || [], 'edu')
      const cleanSkills = ensureKeys(formData?.sections?.skills?.items || formData?.skills || [], 'skill')
      const cleanLanguages = ensureKeys(formData?.sections?.languages?.items || formData?.languages || [], 'lang')
      
      // Filter sections to only include those that exist in sectionOrder (addedSections)
      // Use sectionOrder directly instead of sections.map(s => s.id) to avoid timing issues
      const activeSectionIds = sectionOrder || []
      const filteredSections: any = {}
      
      if (formData?.sections) {
        Object.keys(formData.sections).forEach(key => {
          if (activeSectionIds.includes(key) && formData.sections[key]) {
            // Clean arrays in sections too - but DON'T filter
            if (Array.isArray(formData.sections[key])) {
              // Ensure keys but keep array structure intact
              filteredSections[key] = ensureKeys(formData.sections[key], key)
            } else {
              // For non-array sections (like profile), include them directly
              filteredSections[key] = formData.sections[key]
            }
          }
        })
      }
      // Clean personalInfo: låt text vara '', men ta bort tom bild
      const cleanPersonalInfo = { ...formData?.personalInfo }
      if (cleanPersonalInfo) {
        // Stringifiera alla värden till strängar (säkrare för <Text>)
        // Konvertera undefined och null till tomma strängar
        Object.keys(cleanPersonalInfo).forEach((k) => {
          const v = (cleanPersonalInfo as any)[k]
          if (v == null) {
            (cleanPersonalInfo as any)[k] = ''
          } else if (k === 'optionalFields') {
            // Keep optionalFields as an object, don't stringify it
            (cleanPersonalInfo as any)[k] = v
          } else if (typeof v !== 'string') {
            (cleanPersonalInfo as any)[k] = String(v)
          }
        })
        if (typeof cleanPersonalInfo.photo === 'string' && cleanPersonalInfo.photo.trim() === '') {
          delete cleanPersonalInfo.photo
        }
      }
      
      setDebouncedData({
        personalInfo: cleanPersonalInfo || {},
        workExperience: cleanWorkExperience,
        education: cleanEducation,
        skills: cleanSkills,
        languages: cleanLanguages,
        sections: filteredSections,
        experience: cleanWorkExperience,
      })
    }, 1000) // 1 second debounce for smooth live preview
    
    return () => clearTimeout(timer)
  }, [formData, sections, getStableUid])

  return (
    <ResumePreview
      data={debouncedData}
      sectionOrder={sectionOrder}
      sections={sections}
      templates={templates}
      selectedTemplate={selectedTemplate}
      selectedFont={selectedFont}
      fontSize={fontSizePixels}
      lineHeight={lineHeight}
      textColor={selectedColor}
      headerColor={headerColor}
      zoomLevel={zoomLevel}
      hasChangedTemplate={false}
      onSelectTemplate={onSelectTemplate}
    />
  )
}

export default PreviewBridge

