import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

// API Request/Response Types for new client-side processing approach
const ExtractTextRequestSchema = z.object({
  images: z.array(z.string()), // Array of base64 image data URLs from client-side processing
  fileName: z.string(),
})

const ExtractTextResponseSchema = z.object({
  success: z.boolean(),
  extractedText: z.string(),
  pageCount: z.number(),
  pages: z.array(
    z.object({
      pageNumber: z.number(),
      text: z.string(),
    }),
  ),
  error: z.string().optional(),
})

export type ExtractTextRequest = z.infer<typeof ExtractTextRequestSchema>
export type ExtractTextResponse = z.infer<typeof ExtractTextResponseSchema>

// API Functions
async function extractTextFromImages(
  request: ExtractTextRequest,
): Promise<ExtractTextResponse> {
  console.log(
    `[API Call] Sending ${request.images.length} images for text extraction`,
  )

  const response = await fetch('/api/extract-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return ExtractTextResponseSchema.parse(data)
}

// Query Hooks
export function useExtractText() {
  return useMutation({
    mutationFn: extractTextFromImages,
    onSuccess: (data) => {
      console.log('[Extract Text] Success:', data)
    },
    onError: (error) => {
      console.error('[Extract Text] Error:', error)
    },
  })
}
