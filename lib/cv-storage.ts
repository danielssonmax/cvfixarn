import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEYS = {
  CV_DRAFT: 'cv_draft',
  DRAFT_ID: 'cv_draft_id',
  DRAFT_VERSION: 'cv_draft_version',
}

// Get or create a unique draft ID for this CV session
export function getOrCreateDraftId(): string {
  if (typeof window === 'undefined') return ''
  
  let draftId = localStorage.getItem(STORAGE_KEYS.DRAFT_ID)
  
  if (!draftId) {
    draftId = uuidv4()
    localStorage.setItem(STORAGE_KEYS.DRAFT_ID, draftId)
  }
  
  return draftId
}

// Get current draft ID (without creating)
export function getDraftId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.DRAFT_ID)
}

// Clear draft ID (when synced to database)
export function clearDraftId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.DRAFT_ID)
}

// Save CV to localStorage with version tracking
export function saveCVToLocalStorage(cvData: any, cvId: string): void {
  if (typeof window === 'undefined') return
  
  const version = Date.now()
  
  const payload = {
    ...cvData,
    id: cvId, // Use cvId from URL
    version,
    updated_at: new Date().toISOString(),
  }
  
  localStorage.setItem(STORAGE_KEYS.CV_DRAFT, JSON.stringify(payload))
  localStorage.setItem(STORAGE_KEYS.DRAFT_VERSION, version.toString())
  
  // Broadcast to other tabs
  broadcastStorageUpdate(payload)
}

// Get CV from localStorage
export function getCVFromLocalStorage(): any | null {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(STORAGE_KEYS.CV_DRAFT)
  return saved ? JSON.parse(saved) : null
}

// Get current version
export function getCurrentVersion(): number {
  if (typeof window === 'undefined') return 0
  const version = localStorage.getItem(STORAGE_KEYS.DRAFT_VERSION)
  return version ? parseInt(version, 10) : 0
}

// Clear localStorage (after successful sync)
export function clearCVFromLocalStorage(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.CV_DRAFT)
  localStorage.removeItem(STORAGE_KEYS.DRAFT_VERSION)
  clearDraftId()
  
  // Broadcast clear to other tabs
  broadcastClearStorage()
}

// Check if there's a draft
export function hasCVDraft(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEYS.CV_DRAFT) !== null
}

// BroadcastChannel for multi-tab sync
let broadcastChannel: BroadcastChannel | null = null

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  
  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel('cv-sync')
    } catch (error) {
      console.warn('BroadcastChannel not supported:', error)
      return null
    }
  }
  
  return broadcastChannel
}

// Broadcast storage update to other tabs
function broadcastStorageUpdate(data: any): void {
  const channel = getBroadcastChannel()
  if (channel) {
    channel.postMessage({
      type: 'STORAGE_UPDATE',
      data,
      timestamp: Date.now(),
    })
  }
}

// Broadcast storage clear to other tabs
function broadcastClearStorage(): void {
  const channel = getBroadcastChannel()
  if (channel) {
    channel.postMessage({
      type: 'STORAGE_CLEAR',
      timestamp: Date.now(),
    })
  }
}

// Broadcast successful sync to other tabs
export function broadcastSyncSuccess(cvId: string): void {
  const channel = getBroadcastChannel()
  if (channel) {
    channel.postMessage({
      type: 'SYNC_SUCCESS',
      cvId,
      timestamp: Date.now(),
    })
  }
}

// Listen for broadcast messages
export function subscribeToBroadcast(
  onStorageUpdate: (data: any) => void,
  onStorageClear: () => void,
  onSyncSuccess: (cvId: string) => void
): () => void {
  const channel = getBroadcastChannel()
  
  if (!channel) {
    return () => {} // No-op cleanup
  }
  
  const handler = (event: MessageEvent) => {
    switch (event.data.type) {
      case 'STORAGE_UPDATE':
        onStorageUpdate(event.data.data)
        break
      case 'STORAGE_CLEAR':
        onStorageClear()
        break
      case 'SYNC_SUCCESS':
        onSyncSuccess(event.data.cvId)
        break
    }
  }
  
  channel.addEventListener('message', handler)
  
  // Return cleanup function
  return () => {
    channel.removeEventListener('message', handler)
  }
}
