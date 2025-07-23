/**
 * Environment variable validation and configuration
 */

import { z } from 'zod'

const envSchema = z.object({
  TOGETHER_AI_API_KEY: z.string().min(1, 'TOGETHER_AI_API_KEY is required'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n')
      throw new Error(`❌ Invalid environment variables:\n${missingVars}`)
    }
    throw error
  }
}

// Validate environment variables on import
export const env = validateEnv()

// Export individual variables with proper typing
export const TOGETHER_AI_API_KEY = env.TOGETHER_AI_API_KEY
export const NODE_ENV = env.NODE_ENV

// Environment checks
export const isDevelopment = NODE_ENV === 'development'
export const isProduction = NODE_ENV === 'production'
export const isTest = NODE_ENV === 'test'
