import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Minimal server-side API that only handles TogetherAI vision model calls
// No PDF processing, canvas, or complex dependencies - all done client-side

// Request validation schema
const ExtractTextRequestSchema = z.object({
  images: z.array(z.string()), // Array of base64 image data URLs
  fileName: z.string(),
  startPageNumber: z.number().optional().default(1),
})

// Response schema
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

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json()
    const { images, fileName, startPageNumber } =
      ExtractTextRequestSchema.parse(body)

    console.log(`[Vision API] Starting text extraction for: ${fileName}`)
    console.log(`[Vision API] Processing ${images.length} page images`)

    // Extract text from each page image using Qwen 2-VL-72B
    const extractedPages = []

    for (let i = 0; i < images.length; i++) {
      const pageNumber = startPageNumber + i
      console.log(`[Vision API] Processing page ${pageNumber}/${images.length}`)

      try {
        const extractedText = await extractTextFromImage(images[i])
        extractedPages.push({
          pageNumber,
          text: extractedText,
        })

        console.log(
          `[Vision API] Page ${pageNumber} processed successfully (${extractedText.length} characters)`,
        )
      } catch (error) {
        console.error(
          `[Vision API] Error processing page ${pageNumber}:`,
          error,
        )
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
      `[Vision API] ✅ COMPLETED: Processed ${images.length} pages from ${fileName}`,
    )
    console.log(
      `[Vision API] Total extracted text length: ${combinedText.length} characters`,
    )

    // Return successful response
    const response = ExtractTextResponseSchema.parse({
      success: true,
      extractedText: combinedText,
      pageCount: images.length,
      pages: extractedPages,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Vision API] Error:', error)

    const errorResponse = ExtractTextResponseSchema.parse({
      success: false,
      extractedText: '',
      pageCount: 0,
      pages: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

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
