import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

// API Request/Response Types for text extraction
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

// API Request/Response Types for translation
const TranslateRequestSchema = z.object({
  text: z.string(),
  sourceLanguage: z.enum(['en', 'zh']),
  targetLanguage: z.enum(['en', 'zh']),
  model: z.enum(['qwen2.5-72b', 'kimi-k2', 'deepseek-v3']),
})

const TranslateResponseSchema = z.object({
  success: z.boolean(),
  translatedText: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  model: z.string(),
  error: z.string().optional(),
})

export type ExtractTextRequest = z.infer<typeof ExtractTextRequestSchema>
export type ExtractTextResponse = z.infer<typeof ExtractTextResponseSchema>
export type TranslateRequest = z.infer<typeof TranslateRequestSchema>
export type TranslateResponse = z.infer<typeof TranslateResponseSchema>

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

// Translation API function
async function translateText(
  request: TranslateRequest,
): Promise<TranslateResponse> {
  console.log(
    `[API Call] Translating text using ${request.model} (${request.sourceLanguage} → ${request.targetLanguage})`,
  )

  const response = await fetch('/api/translate', {
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
  return TranslateResponseSchema.parse(data)
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

export function useTranslateText() {
  return useMutation({
    mutationFn: translateText,
    onSuccess: (data) => {
      console.log('[Translate Text] Success:', data)
    },
    onError: (error) => {
      console.error('[Translate Text] Error:', error)
    },
  })
}
