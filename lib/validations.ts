import { z } from "zod"

// Common validation schemas
export const emailSchema = z.string().email("Ogiltig e-postadress").min(1, "E-post krävs")
export const passwordSchema = z.string().min(6, "Lösenord måste vara minst 6 tecken").max(100, "Lösenord för långt")
export const nameSchema = z.string().min(1, "Namn krävs").max(100, "Namn för långt").regex(/^[a-zA-ZåäöÅÄÖ\s-']+$/, "Namn får endast innehålla bokstäver, mellanslag, bindestreck och apostrofer")
export const userIdSchema = z.string().uuid("Ogiltigt användar-ID")

// API endpoint validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z.object({
  userId: userIdSchema,
  email: emailSchema,
  name: nameSchema,
})

export const createUserSchema = z.object({
  userId: userIdSchema,
  email: emailSchema,
  name: nameSchema,
})

export const createCheckoutSessionSchema = z.object({
  priceId: z.string().min(1, "Price ID krävs").regex(/^price_[a-zA-Z0-9]+$/, "Ogiltigt price ID format"),
  userId: userIdSchema,
})

export const createPaymentIntentSchema = z.object({
  amount: z.number().int().min(50, "Belopp måste vara minst 50 öre").max(1000000, "Belopp för högt"),
})

export const checkPremiumSchema = z.object({
  email: emailSchema,
})

export const checkoutSessionSchema = z.object({
  session_id: z.string().min(1, "Session ID krävs"),
})

// CV data validation schemas
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "Förnamn krävs").max(50, "Förnamn för långt"),
  lastName: z.string().min(1, "Efternamn krävs").max(50, "Efternamn för långt"),
  email: emailSchema,
  phone: z.string().regex(/^[\+]?[0-9\s\-\(\)]+$/, "Ogiltigt telefonnummer").optional(),
  location: z.string().max(100, "Plats för lång").optional(),
  summary: z.string().max(1000, "Sammanfattning för lång").optional(),
  photo: z.string().url("Ogiltig bild-URL").optional().or(z.literal("")),
  address: z.string().max(200, "Adress för lång").optional(),
  postalCode: z.string().regex(/^[0-9]{3}\s?[0-9]{2}$/, "Ogiltigt postnummer").optional(),
})

export const workExperienceSchema = z.object({
  company: z.string().min(1, "Företagsnamn krävs").max(100, "Företagsnamn för långt"),
  position: z.string().min(1, "Position krävs").max(100, "Position för lång"),
  location: z.string().max(100, "Plats för lång").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startYear: z.number().int().min(1950).max(new Date().getFullYear() + 10).optional(),
  endYear: z.number().int().min(1950).max(new Date().getFullYear() + 10).optional(),
  current: z.boolean().optional(),
  description: z.string().max(2000, "Beskrivning för lång").optional(),
})

export const educationSchema = z.object({
  school: z.string().min(1, "Skola krävs").max(100, "Skola för lång"),
  degree: z.string().min(1, "Examen krävs").max(100, "Examen för lång"),
  location: z.string().max(100, "Plats för lång").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startYear: z.number().int().min(1950).max(new Date().getFullYear() + 10).optional(),
  endYear: z.number().int().min(1950).max(new Date().getFullYear() + 10).optional(),
  current: z.boolean().optional(),
  description: z.string().max(2000, "Beskrivning för lång").optional(),
})

export const skillSchema = z.object({
  name: z.string().min(1, "Färdighet krävs").max(50, "Färdighet för lång"),
  level: z.number().int().min(1).max(5).optional(),
})

export const languageSchema = z.object({
  name: z.string().min(1, "Språk krävs").max(50, "Språk för lång"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Native"]).optional(),
})

export const cvDataSchema = z.object({
  personalInfo: personalInfoSchema,
  workExperience: z.array(workExperienceSchema).max(20, "För många arbetserfarenheter"),
  education: z.array(educationSchema).max(10, "För många utbildningar"),
  skills: z.array(skillSchema).max(50, "För många färdigheter"),
  languages: z.array(languageSchema).max(20, "För många språk"),
  sections: z.record(z.any()).optional(),
})

// Validation helper functions
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return { success: false, errors: ["Valideringsfel"] }
  }
}

// Sanitization helper
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim()
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  if (input && typeof input === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  return input
}
