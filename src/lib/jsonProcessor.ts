// Client-side JSON processing utilities
// Handles JSON file reading, validation, and preparation for translation

export interface JSONProcessingResult {
  content: string
  structure: object
  keyCount: number
  success: boolean
  error?: string
}

export interface JSONChunk {
  path: string
  value: string
  originalValue: unknown
}

/**
 * Read and parse JSON file on client-side
 */
export async function processJSONFile(
  file: File,
): Promise<JSONProcessingResult> {
  try {
    console.log('[JSON Processing] Starting JSON file processing...')

    // Read file content as text
    const text = await file.text()
    console.log(
      `[JSON Processing] File read complete, size: ${text.length} characters`,
    )

    // Parse JSON to validate structure
    let parsed: object
    try {
      parsed = JSON.parse(text) as object
    } catch (parseError) {
      console.error('[JSON Processing] JSON parsing failed:', parseError)
      return {
        content: '',
        structure: {},
        keyCount: 0,
        success: false,
        error: 'Invalid JSON format - please check your file syntax',
      }
    }

    // Count total keys for progress tracking
    const keyCount = countJSONKeys(parsed)
    console.log(
      `[JSON Processing] JSON parsed successfully, ${keyCount} keys found`,
    )

    // Extract translatable text content
    const textContent = extractTextFromJSON(parsed)
    console.log(
      `[JSON Processing] Extracted ${textContent.length} characters of text content`,
    )

    return {
      content: textContent,
      structure: parsed,
      keyCount,
      success: true,
    }
  } catch (error) {
    console.error('[JSON Processing] Error processing JSON file:', error)
    return {
      content: '',
      structure: {},
      keyCount: 0,
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown JSON processing error',
    }
  }
}

/**
 * Extract translatable text content from JSON structure
 * Simply returns the formatted JSON for complete translation
 */
export function extractTextFromJSON(obj: unknown): string {
  // Return the complete JSON structure formatted for translation
  // The translation model will handle translating both keys and values while preserving structure
  return JSON.stringify(obj, null, 2)
}

/**
 * Check if a string looks like translatable content
 */
function isTranslatableText(text: string): boolean {
  if (!text || text.length === 0) return false

  // Skip very short strings (likely IDs or codes)
  if (text.length < 3) return false

  // Skip strings that look like technical identifiers
  const technicalPatterns = [
    /^[a-z_]+$/, // snake_case identifiers like "user_id"
    /^[A-Z_]+$/, // CONSTANT_NAMES like "API_KEY"
    /^https?:\/\//, // URLs
    /^[0-9]+$/, // pure numbers
    /^[a-f0-9-]{36}$/, // UUIDs
    /^[a-zA-Z0-9_-]{1,20}$/, // very short technical IDs
  ]

  // If string contains spaces, it's definitely translatable text
  if (text.includes(' ')) {
    return true
  }

  // Check against technical patterns
  for (const pattern of technicalPatterns) {
    if (pattern.test(text)) {
      return false
    }
  }

  // For camelCase or mixed case (like "copyDetails"), consider it translatable
  // These are likely user-facing property names that should be translated
  if (/[a-z]/.test(text) && /[A-Z]/.test(text)) {
    return true // camelCase like "copyDetails"
  }

  // If it contains letters and is reasonably long, consider it translatable
  return /[a-zA-Z]/.test(text) && text.length >= 4
}

/**
 * Count total number of translatable items (keys + values) in JSON structure for progress tracking
 */
export function countJSONKeys(obj: unknown): number {
  if (typeof obj === 'string') {
    return isTranslatableText(obj) ? 1 : 0
  } else if (Array.isArray(obj)) {
    return obj.reduce((count, item) => count + countJSONKeys(item), 0)
  } else if (obj && typeof obj === 'object') {
    let count = 0

    Object.entries(obj).forEach(([key, value]) => {
      // Count translatable keys
      if (isTranslatableText(key)) {
        count += 1
      }

      // Count translatable values
      count += countJSONKeys(value)
    })

    return count
  }

  return 0
}

/**
 * Create chunks from JSON for batch processing
 */
export function createJSONChunks(
  obj: unknown,
  chunkSize = 10,
  path = '',
): JSONChunk[] {
  const chunks: JSONChunk[] = []

  function collectTranslatableStrings(current: unknown, currentPath: string) {
    if (typeof current === 'string' && isTranslatableText(current)) {
      chunks.push({
        path: currentPath,
        value: current,
        originalValue: current,
      })
    } else if (Array.isArray(current)) {
      current.forEach((item, index) => {
        const itemPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`
        collectTranslatableStrings(item, itemPath)
      })
    } else if (current && typeof current === 'object') {
      Object.entries(current).forEach(([key, value]) => {
        const keyPath = currentPath ? `${currentPath}.${key}` : key
        collectTranslatableStrings(value, keyPath)
      })
    }
  }

  collectTranslatableStrings(obj, path)

  // Group chunks by chunkSize
  const groupedChunks: JSONChunk[][] = []
  for (let i = 0; i < chunks.length; i += chunkSize) {
    groupedChunks.push(chunks.slice(i, i + chunkSize))
  }

  return chunks
}

/**
 * Validate JSON file structure and size
 */
export function validateJSONStructure(file: File): {
  valid: boolean
  error?: string
} {
  // Basic file size check
  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    return { valid: false, error: 'JSON file too large (max 10MB)' }
  }

  if (file.size === 0) {
    return { valid: false, error: 'JSON file is empty' }
  }

  return { valid: true }
}
