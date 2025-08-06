import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Translation API endpoint that supports 3 translation models
// Handles Stage 2 of the pipeline: text translation after extraction

// Supported translation models (serverless-compatible)
const TRANSLATION_MODELS = {
  'qwen2.5-72b': 'Qwen/Qwen2.5-72B-Instruct',
  'kimi-k2': 'moonshotai/Kimi-K2-Instruct',
  'deepseek-v3': 'deepseek-ai/DeepSeek-V3',
} as const

type TranslationModel = keyof typeof TRANSLATION_MODELS

// Request validation schema
const TranslateRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  sourceLanguage: z.enum(['en', 'zh']),
  targetLanguage: z.enum(['en', 'zh']),
  model: z.enum(['qwen2.5-72b', 'kimi-k2', 'deepseek-v3']),
})

// Response schema
const TranslateResponseSchema = z.object({
  success: z.boolean(),
  translatedText: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  model: z.string(),
  error: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json()
    const { text, sourceLanguage, targetLanguage, model } =
      TranslateRequestSchema.parse(body)

    console.log(`[Translation API] Starting translation using ${model}`)
    console.log(
      `[Translation API] Direction: ${sourceLanguage} → ${targetLanguage}`,
    )
    console.log(`[Translation API] Text length: ${text.length} characters`)

    // Validate language direction
    if (sourceLanguage === targetLanguage) {
      throw new Error('Source and target languages cannot be the same')
    }

    // Translate text using selected model
    const translatedText = await translateText({
      text,
      sourceLanguage,
      targetLanguage,
      model,
    })

    console.log(`[Translation API] ✅ Translation completed using ${model}`)
    console.log(
      `[Translation API] Translated text length: ${translatedText.length} characters`,
    )

    // Return successful response
    const response = TranslateResponseSchema.parse({
      success: true,
      translatedText,
      sourceLanguage,
      targetLanguage,
      model,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Translation API] Error:', error)

    const errorResponse = TranslateResponseSchema.parse({
      success: false,
      translatedText: '',
      sourceLanguage: '',
      targetLanguage: '',
      model: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

interface TranslateParams {
  text: string
  sourceLanguage: string
  targetLanguage: string
  model: TranslationModel
}

async function translateText({
  text,
  sourceLanguage,
  targetLanguage,
  model,
}: TranslateParams): Promise<string> {
  try {
    console.log(`[Translation Model] Using ${model} for translation`)

    // Validate API key
    const TOGETHER_AI_API_KEY = process.env.TOGETHER_AI_API_KEY
    if (!TOGETHER_AI_API_KEY) {
      throw new Error('TOGETHER_AI_API_KEY environment variable is not set')
    }

    // Build language-specific prompt
    const languageNames = {
      en: 'English',
      zh: 'Traditional Chinese',
    }

    const prompt = `You are a professional translator. Please translate the following text from ${languageNames[sourceLanguage as keyof typeof languageNames]} to ${languageNames[targetLanguage as keyof typeof languageNames]}. 

Requirements:
- Maintain the original meaning and context
- Preserve formatting and structure where possible, including page markers like "--- Page X ---"
- Use natural, fluent language in the target language
- Keep page separators exactly as they are (do not translate "--- Page X ---")
- Do not add any explanations or comments
- Return only the translated text

Text to translate:
${text}`

    // Get model endpoint for the selected translation model
    const modelEndpoint = TRANSLATION_MODELS[model]

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
          model: modelEndpoint,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 4000,
          temperature: 0.3, // Low temperature for consistent translation
          top_p: 0.9,
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`TogetherAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const translatedText = data.choices?.[0]?.message?.content || ''

    if (!translatedText.trim()) {
      throw new Error('Empty translation response from model')
    }

    console.log(
      `[Translation Model] Successfully translated ${text.length} → ${translatedText.length} characters`,
    )

    return translatedText.trim()
  } catch (error) {
    console.error(`[Translation Model] Error using ${model}:`, error)
    throw new Error(
      `Translation failed with ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
