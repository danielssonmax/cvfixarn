import { useEffect, useRef, useCallback } from 'react'

interface AutosaveOptions {
  delay?: number // Debounce delay in ms (default: 800)
  onSave: (data: any) => Promise<void>
  enabled?: boolean
}

export function useDebouncedAutosave(
  data: any,
  options: AutosaveOptions
) {
  const { delay = 800, onSave, enabled = true } = options
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<string | null>(null)
  const isSavingRef = useRef(false)

  const save = useCallback(async (currentData: any) => {
    if (isSavingRef.current) {
      return
    }
    
    const dataString = JSON.stringify(currentData)
    
    // Skip if data hasn't changed
    if (previousDataRef.current === dataString) {
      return
    }
    
    previousDataRef.current = dataString
    isSavingRef.current = true
    
    try {
      await onSave(currentData)
    } catch (error) {
      // Silently handle autosave errors
    } finally {
      isSavingRef.current = false
    }
  }, [onSave])

  useEffect(() => {
    if (!enabled || !data) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Check if data actually changed before scheduling
    const dataString = JSON.stringify(data)
    if (previousDataRef.current === dataString) {
      // Data hasn't changed, don't schedule save
      return
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save(data)
    }, delay)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, save])

  return {
    isSaving: isSavingRef.current,
  }
}

