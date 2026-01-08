import { NextRequest } from "next/server"

// File upload configuration
export const FILE_UPLOAD_CONFIG = {
  // Maximum file size (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  // Allowed file types
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  // Allowed file extensions
  ALLOWED_EXTENSIONS: [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.txt', '.doc', '.docx'
  ],
  // Upload directory
  UPLOAD_DIR: '/tmp/uploads',
  // Maximum number of files per request
  MAX_FILES: 5,
}

// File validation interface
interface FileValidationResult {
  valid: boolean
  error?: string
  sanitizedFilename?: string
}

// Validate file type
export function validateFileType(file: File): FileValidationResult {
  // Check MIME type
  if (!FILE_UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    }
  }
  
  // Check file extension
  const extension = getFileExtension(file.name)
  if (!FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed`
    }
  }
  
  return { valid: true }
}

// Validate file size
export function validateFileSize(file: File): FileValidationResult {
  if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${file.size} exceeds maximum allowed size of ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE} bytes`
    }
  }
  
  return { valid: true }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const sanitized = filename
    .replace(/\.\./g, '') // Remove .. 
    .replace(/[\/\\]/g, '_') // Replace path separators
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters
    .replace(/_+/g, '_') // Replace multiple underscores
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
  
  // Ensure filename is not empty
  if (!sanitized) {
    return 'file_' + Date.now()
  }
  
  return sanitized
}

// Get file extension
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.substring(lastDot).toLowerCase()
}

// Generate unique filename
export function generateUniqueFilename(originalFilename: string): string {
  const extension = getFileExtension(originalFilename)
  const sanitized = sanitizeFilename(originalFilename.replace(extension, ''))
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  
  return `${sanitized}_${timestamp}_${random}${extension}`
}

// Validate uploaded file
export function validateUploadedFile(file: File): FileValidationResult {
  // Validate file type
  const typeValidation = validateFileType(file)
  if (!typeValidation.valid) {
    return typeValidation
  }
  
  // Validate file size
  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.valid) {
    return sizeValidation
  }
  
  // Sanitize filename
  const sanitizedFilename = generateUniqueFilename(file.name)
  
  return {
    valid: true,
    sanitizedFilename
  }
}

// File upload middleware
export async function validateFileUploadMiddleware(request: NextRequest): Promise<{
  valid: boolean
  error?: string
  files?: File[]
}> {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    // Check number of files
    if (files.length > FILE_UPLOAD_CONFIG.MAX_FILES) {
      return {
        valid: false,
        error: `Too many files. Maximum ${FILE_UPLOAD_CONFIG.MAX_FILES} files allowed`
      }
    }
    
    // Validate each file
    for (const file of files) {
      const validation = validateUploadedFile(file)
      if (!validation.valid) {
        return {
          valid: false,
          error: validation.error
        }
      }
    }
    
    return {
      valid: true,
      files
    }
  } catch (error) {
    console.error('File upload validation error:', error)
    return {
      valid: false,
      error: 'File upload validation failed'
    }
  }
}

// Scan file for malicious content (basic implementation)
export async function scanFileForMalware(file: File): Promise<{
  safe: boolean
  error?: string
}> {
  try {
    // Basic file content validation
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    
    // Check for common malicious patterns
    const content = String.fromCharCode(...uint8Array.slice(0, 1024)) // First 1KB
    
    // Check for script tags
    if (content.includes('<script') || content.includes('javascript:')) {
      return {
        safe: false,
        error: 'File contains potentially malicious script content'
      }
    }
    
    // Check for executable signatures
    const executableSignatures = [
      [0x4D, 0x5A], // PE executable
      [0x7F, 0x45, 0x4C, 0x46], // ELF executable
    ]
    
    for (const signature of executableSignatures) {
      if (uint8Array.length >= signature.length) {
        let match = true
        for (let i = 0; i < signature.length; i++) {
          if (uint8Array[i] !== signature[i]) {
            match = false
            break
          }
        }
        if (match) {
          return {
            safe: false,
            error: 'File appears to be an executable'
          }
        }
      }
    }
    
    return { safe: true }
  } catch (error) {
    console.error('File scanning error:', error)
    return {
      safe: false,
      error: 'File scanning failed'
    }
  }
}

// File upload error response
export function createFileUploadErrorResponse(error: string) {
  return new Response(
    JSON.stringify({ 
      error: 'File upload failed', 
      message: error 
    }),
    { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
