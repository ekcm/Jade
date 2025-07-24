// Client-side PDF processing using browser PDF.js
// This avoids all serverless dependency issues by processing in browser

declare global {
  interface Window {
    pdfjsLib: any
  }
}

export interface PDFProcessingResult {
  images: string[]
  pageCount: number
  success: boolean
  error?: string
}

export async function loadPDFJS(): Promise<void> {
  // Load PDF.js from CDN if not already loaded
  if (typeof window !== 'undefined' && !window.pdfjsLib) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => {
        // Set worker source
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        resolve()
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
}

export async function convertPDFToImages(
  file: File,
  onProgress?: (current: number, total: number) => void,
): Promise<PDFProcessingResult> {
  try {
    console.log('[Client PDF Processing] Starting PDF-to-image conversion...')

    // Ensure PDF.js is loaded
    await loadPDFJS()

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    console.log(
      `[Client PDF Processing] PDF buffer size: ${uint8Array.length} bytes`,
    )

    // Load PDF document
    const loadingTask = window.pdfjsLib.getDocument({ data: uint8Array })
    const pdfDocument = await loadingTask.promise

    const pageCount = pdfDocument.numPages
    console.log(`[Client PDF Processing] PDF has ${pageCount} page(s)`)

    const images: string[] = []

    // Process each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      console.log(
        `[Client PDF Processing] Processing page ${pageNum}/${pageCount}`,
      )

      try {
        // Get page
        const page = await pdfDocument.getPage(pageNum)

        // Set scale for high quality (2x for better text recognition)
        const scale = 2.0
        const viewport = page.getViewport({ scale })

        // Create canvas element
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('Could not get canvas 2D context')
        }

        canvas.width = viewport.width
        canvas.height = viewport.height

        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        console.log(
          `[Client PDF Processing] Rendering page ${pageNum} to canvas (${viewport.width}x${viewport.height})`,
        )

        await page.render(renderContext).promise

        // Convert canvas to base64 image
        const imageDataUrl = canvas.toDataURL('image/png', 0.95)
        images.push(imageDataUrl)

        console.log(
          `[Client PDF Processing] Page ${pageNum} converted to base64 (${imageDataUrl.length} characters)`,
        )

        // Report progress
        if (onProgress) {
          onProgress(pageNum, pageCount)
        }
      } catch (pageError) {
        console.error(
          `[Client PDF Processing] Error processing page ${pageNum}:`,
          pageError,
        )
        // Add placeholder for failed pages to maintain page order
        images.push(
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        )
      }
    }

    console.log(
      `[Client PDF Processing] ✅ Successfully converted PDF to ${images.length} page images`,
    )

    return {
      images,
      pageCount,
      success: true,
    }
  } catch (error) {
    console.error(
      '[Client PDF Processing] Error converting PDF to images:',
      error,
    )
    return {
      images: [],
      pageCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
