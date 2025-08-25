import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Multi-format text extraction API
// Handles both PDF (via vision model) and JSON (direct processing) extraction
// All file processing is done client-side to avoid serverless dependencies

// Request validation schemas for different file types
const PDFExtractRequestSchema = z.object({
  type: z.literal('pdf'),
  images: z.array(z.string()), // Array of base64 image data URLs
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

// Response schema (same for both PDF and JSON)
const ExtractTextResponseSchema = z.object({
  success: z.boolean(),
  extractedText: z.string(),
  pageCount: z.number(), // For PDF: actual pages, For JSON: chunk count
  pages: z.array(
    z.object({
      pageNumber: z.number(), // For PDF: page number, For JSON: chunk index
      text: z.string(),
    }),
  ),
  fileType: z.enum(['pdf', 'json']),
  error: z.string().optional(),
})

export async function POST(request: NextRequest) {
  let detectedFileType: 'pdf' | 'json' = 'pdf' // Default fallback

  try {
    // Parse and validate request
    const body = await request.json()

    // Try to detect file type from raw body before validation
    if (body?.type === 'json') {
      detectedFileType = 'json'
    }

    const requestData = ExtractTextRequestSchema.parse(body)
    detectedFileType = requestData.type // Update with validated type

    console.log(
      `[Extract API] Starting extraction for: ${requestData.fileName}`,
    )
    console.log(`[Extract API] File type: ${requestData.type}`)

    // Route to appropriate processing based on file type
    if (requestData.type === 'pdf') {
      return await processPDFExtraction(requestData)
    } else if (requestData.type === 'json') {
      return await processJSONExtraction(requestData)
    }

    throw new Error('Unsupported file type')
  } catch (error) {
    console.error('[Extract API] Error:', error)

    const errorResponse = ExtractTextResponseSchema.parse({
      success: false,
      extractedText: '',
      pageCount: 0,
      pages: [],
      fileType: detectedFileType, // Use detected file type instead of hardcoded 'pdf'
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// PDF processing using vision model (original logic)
async function processPDFExtraction(
  requestData: z.infer<typeof PDFExtractRequestSchema>,
): Promise<NextResponse> {
  const { images, fileName, startPageNumber } = requestData

  console.log(`[PDF API] Processing ${images.length} page images`)

  // Extract text from each page image using Qwen 2-VL-72B
  const extractedPages = []

  for (let i = 0; i < images.length; i++) {
    const pageNumber = startPageNumber + i
    console.log(`[PDF API] Processing page ${pageNumber}/${images.length}`)

    try {
      const extractedText = await extractTextFromImage(images[i])
      extractedPages.push({
        pageNumber,
        text: extractedText,
      })

      console.log(
        `[PDF API] Page ${pageNumber} processed successfully (${extractedText.length} characters)`,
      )
    } catch (error) {
      console.error(`[PDF API] Error processing page ${pageNumber}:`, error)
      extractedPages.push({
        pageNumber,
        text: `[Error extracting text from page ${pageNumber}]`,
      })
    }
  }

  // Combine all extracted text
  const combinedText = extractedPages
    .map((page) => `--- Page ${page.pageNumber} ---\n${page.text}`)
    .join('\n\n')

  console.log(
    `[PDF API] ✅ COMPLETED: Processed ${images.length} pages from ${fileName}`,
  )
  console.log(
    `[PDF API] Total extracted text length: ${combinedText.length} characters`,
  )

  // Return successful response
  const response = ExtractTextResponseSchema.parse({
    success: true,
    extractedText: combinedText,
    pageCount: images.length,
    pages: extractedPages,
    fileType: 'pdf',
  })

  return NextResponse.json(response)
}

// JSON processing (direct text extraction)
async function processJSONExtraction(
  requestData: z.infer<typeof JSONExtractRequestSchema>,
): Promise<NextResponse> {
  const { content, fileName } = requestData

  console.log(`[JSON API] Processing JSON content for: ${fileName}`)
  console.log(`[JSON API] Content length: ${content.length} characters`)

  try {
    // The content is already extracted text from client-side processing
    // No need to parse JSON again - just use the pre-extracted text
    const textContent = content

    console.log(`[JSON API] Using pre-extracted text content`)
    console.log(
      `[JSON API] Text content length: ${textContent.length} characters`,
    )

    // For JSON, we treat the entire content as one "page" for consistency with PDF format
    const extractedPages = [
      {
        pageNumber: 1,
        text: textContent,
      },
    ]

    console.log(`[JSON API] ✅ COMPLETED: Processed JSON from ${fileName}`)

    // Return successful response
    const response = ExtractTextResponseSchema.parse({
      success: true,
      extractedText: textContent,
      pageCount: 1, // JSON is treated as single "page"
      pages: extractedPages,
      fileType: 'json',
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[JSON API] Error processing JSON:', error)
    throw new Error(
      `JSON processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

// Note: JSON processing is now done client-side
// Server-side only handles pre-extracted text content

async function extractTextFromImage(imageBase64: string): Promise<string> {
  try {
    console.log('[Vision Model] Calling Qwen 2-VL-72B for text extraction...')

    // Validate API key
    const TOGETHER_AI_API_KEY = process.env.TOGETHER_AI_API_KEY
    if (!TOGETHER_AI_API_KEY) {
      throw new Error('TOGETHER_AI_API_KEY environment variable is not set')
    }

    // Use direct HTTP fetch to avoid library dependency issues
    const response = await fetch(
      'https://api.together.xyz/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2-VL-72B-Instruct',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please extract all text from this image. Return only the extracted text content, preserving the original formatting and structure as much as possible. Do not add any explanations or comments.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64,
                  },
                },
              ],
            },
          ],
          max_tokens: 4000,
          temperature: 0.1, // Low temperature for consistent text extraction
          top_p: 0.9,
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`TogetherAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const extractedText = data.choices?.[0]?.message?.content || ''

    console.log(
      `[Vision Model] Successfully extracted ${extractedText.length} characters`,
    )

    return extractedText.trim()
  } catch (error) {
    console.error('[Vision Model] Error calling Qwen 2-VL-72B:', error)
    throw new Error(
      `Vision model extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
