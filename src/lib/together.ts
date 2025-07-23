/**
 * TogetherAI client configuration and utilities
 */

import Together from 'together-ai'
import { TOGETHER_AI_API_KEY } from './env'

// Initialize TogetherAI client
export const together = new Together({
  apiKey: TOGETHER_AI_API_KEY,
})

// Available vision models for PDF translation
export const VISION_MODELS = {
  QWEN_VL_72B: 'Qwen/Qwen2-VL-72B-Instruct',
} as const

export type VisionModel = (typeof VISION_MODELS)[keyof typeof VISION_MODELS]

// Default model configuration
export const DEFAULT_MODEL: VisionModel = VISION_MODELS.QWEN_VL_72B

// Rate limiting configuration (600 RPM = 10 requests per second)
export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 600,
  REQUESTS_PER_SECOND: 10,
  DELAY_BETWEEN_REQUESTS: 100, // 100ms delay between requests
  MAX_RETRIES: 3,
  BACKOFF_MULTIPLIER: 2,
} as const

// Model-specific configurations
export const MODEL_CONFIG = {
  [VISION_MODELS.QWEN_VL_72B]: {
    maxTokens: 4000,
    temperature: 0.1,
    topP: 0.9,
    supportedFormats: ['pdf', 'image'],
    description: 'Qwen 2-VL-72B - Best for document translation',
  },
} as const

// Translation direction types
export type TranslationDirection = 'en-to-zh' | 'zh-to-en'

// Translation request interface
export interface TranslationRequest {
  file: File
  model: VisionModel
  direction: TranslationDirection
  customPrompt?: string
}

// Translation response interface
export interface TranslationResponse {
  success: boolean
  translatedText?: string
  originalText?: string
  model: VisionModel
  direction: TranslationDirection
  processingTime?: number
  error?: string
}

// Multi-page translation interfaces
export interface PageTranslation {
  pageNumber: number
  originalText: string
  translatedText: string
  success: boolean
  error?: string
}

export interface MultiPageTranslationResponse {
  success: boolean
  pages: PageTranslation[]
  totalPages: number
  completedPages: number
  model: VisionModel
  direction: TranslationDirection
  totalProcessingTime: number
  errors: string[]
}

/**
 * Convert File to base64 string for API consumption
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Failed to convert file to base64'))
    reader.readAsDataURL(file)
  })
}

/**
 * Generate translation prompt based on direction
 */
export function generateTranslationPrompt(
  direction: TranslationDirection,
  customPrompt?: string,
): string {
  if (customPrompt) {
    return customPrompt
  }

  const prompts = {
    'en-to-zh': `You are a professional translator specializing in English to Traditional Chinese translation. 
Please translate the text in this PDF document from English to Traditional Chinese. 
Maintain the original formatting, structure, and meaning as much as possible. 
Provide only the translated text without any additional commentary or explanations.`,

    'zh-to-en': `You are a professional translator specializing in Traditional Chinese to English translation. 
Please translate the text in this PDF document from Traditional Chinese to English. 
Maintain the original formatting, structure, and meaning as much as possible. 
Provide only the translated text without any additional commentary or explanations.`,
  }

  return prompts[direction]
}

/**
 * Validate if a model supports the requested operation
 */
export function validateModelSupport(
  model: VisionModel,
  format: string,
): boolean {
  return MODEL_CONFIG[model].supportedFormats.includes(format as any)
}

/**
 * Get model display information
 */
export function getModelInfo(model: VisionModel) {
  return {
    name: model,
    ...MODEL_CONFIG[model],
  }
}
