import { z } from 'zod'

// File validation schema
export const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type === 'application/pdf', {
      message: 'File must be a PDF',
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size must be less than 10MB',
    })
    .refine((file) => file.size > 0, {
      message: 'File cannot be empty',
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
      error: 'Invalid file',
    }
  }
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

// Helper function to estimate PDF page count based on file size
export function estimatePageCount(fileSizeBytes: number): string {
  // Very rough estimation: average PDF page ~100KB
  // This is just for display purposes, actual pages will be determined during processing
  const estimatedPages = Math.max(1, Math.round(fileSizeBytes / (100 * 1024)))
  return `~${estimatedPages} page${estimatedPages !== 1 ? 's' : ''}`
}
