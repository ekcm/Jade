import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

// API Request/Response Types for text extraction (multi-format)
const PDFExtractRequestSchema = z.object({
  type: z.literal('pdf'),
  images: z.array(z.string()), // Array of base64 image data URLs from client-side processing
  fileName: z.string(),
  startPageNumber: z.number().optional().default(1),
})

const JSONExtractRequestSchema = z.object({
  type: z.literal('json'),
  content: z.string(), // JSON content as string
  fileName: z.string(),
})

const ExtractTextRequestSchema = z.discriminatedUnion('type', [
  PDFExtractRequestSchema,
  JSONExtractRequestSchema,
])

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
  fileType: z.enum(['pdf', 'json']),
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

export type PDFExtractRequest = z.infer<typeof PDFExtractRequestSchema>
export type JSONExtractRequest = z.infer<typeof JSONExtractRequestSchema>
export type ExtractTextRequest = z.infer<typeof ExtractTextRequestSchema>
export type ExtractTextResponse = z.infer<typeof ExtractTextResponseSchema>
export type TranslateRequest = z.infer<typeof TranslateRequestSchema>
export type TranslateResponse = z.infer<typeof TranslateResponseSchema>

// API Functions for multi-format extraction
async function extractText(
  request: ExtractTextRequest,
): Promise<ExtractTextResponse> {
  if (request.type === 'pdf') {
    console.log(
      `[API Call] Sending ${request.images.length} PDF images for text extraction`,
    )
  } else if (request.type === 'json') {
    console.log(
      `[API Call] Sending JSON content for text extraction (${request.content.length} chars)`,
    )
  }

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
    mutationFn: extractText,
    onSuccess: (data) => {
      console.log(`[Extract Text] Success (${data.fileType}):`, data)
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
