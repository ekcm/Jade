import { z } from 'zod'
import {
  FILE_SIZE_UNITS,
  FILE_UPLOAD_CONFIG,
  VALIDATION_MESSAGES,
} from './constants'

// File validation schema
export const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) =>
        FILE_UPLOAD_CONFIG.ACCEPTED_TYPES.includes(
          file.type as (typeof FILE_UPLOAD_CONFIG.ACCEPTED_TYPES)[number],
        ),
      {
        message: VALIDATION_MESSAGES.FILE_TYPE_ERROR,
      },
    )
    .refine((file) => file.size <= FILE_UPLOAD_CONFIG.MAX_FILE_SIZE, {
      message: VALIDATION_MESSAGES.FILE_SIZE_ERROR,
    })
    .refine((file) => file.size > 0, {
      message: VALIDATION_MESSAGES.FILE_EMPTY_ERROR,
    }),
})

// Export the type for TypeScript
export type FileValidation = z.infer<typeof fileSchema>

// Validation function that returns detailed error information
export function validateFile(file: File): {
  success: boolean
  error?: string
  data?: { file: File }
} {
  try {
    const result = fileSchema.parse({ file })
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return {
        success: false,
        error: firstError.message,
      }
    }
    return {
      success: false,
      error: VALIDATION_MESSAGES.INVALID_FILE_ERROR,
    }
  }
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = FILE_SIZE_UNITS
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

// Helper function to estimate PDF page count based on file size
export function estimatePageCount(fileSizeBytes: number): string {
  // Very rough estimation based on average PDF page size
  // This is just for display purposes, actual pages will be determined during processing
  const estimatedPages = Math.max(
    1,
    Math.round(fileSizeBytes / FILE_UPLOAD_CONFIG.PAGE_SIZE_ESTIMATE),
  )
  return `~${estimatedPages} page${estimatedPages !== 1 ? 's' : ''}`
}
