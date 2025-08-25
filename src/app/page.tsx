'use client'

import { DocumentViewer } from '@/components/DocumentViewer'
import { FileUpload } from '@/components/FileUpload'
import { TranslationContainer } from '@/components/TranslationContainer'
import { Button } from '@/components/ui/button'
import { UI_TEXT } from '@/lib/constants'
import { processJSONFile } from '@/lib/jsonProcessor'
import { convertPDFToImages } from '@/lib/pdfProcessor'
import { useExtractText, useTranslateText } from '@/lib/queries'
import { useAppStore } from '@/lib/store'
import { getFileType } from '@/lib/validations'
import type { SSRFile } from '@/types/file'
import { isFile } from '@/types/file'

export default function Home() {
  // Get state and actions from Zustand store
  const {
    selectedFile,
    fileType,
    languageDirection,
    selectedModel,
    isTranslating,
    originalText,
    translatedText,
    setSelectedFile,
    setLanguageDirection,
    setSelectedModel,
    setIsTranslating,
    setOriginalText,
    setTranslatedText,
    setPageCount,
    setKeyCount,
    setProgress,
    addError,
    clearPDF,
  } = useAppStore()

  // Text extraction and translation mutations
  const extractTextMutation = useExtractText()
  const translateTextMutation = useTranslateText()

  const handleFileSelect = (file: SSRFile) => {
    if (typeof window !== 'undefined') {
      setSelectedFile(file)
      console.log('File selected:', file.name)
    }
  }

  const handleFileClear = () => {
    clearPDF()
    if (typeof window !== 'undefined') {
      console.log('File cleared')
    }
  }

  // Get panel title based on file type
  const getPanelTitle = () => {
    if (!selectedFile || !isFile(selectedFile)) {
      return UI_TEXT.PANELS.DOCUMENT_VIEWER_TITLE
    }

    const fileType = getFileType(selectedFile)
    switch (fileType) {
      case 'pdf':
        return UI_TEXT.PANELS.PDF_VIEWER_TITLE
      case 'json':
        return UI_TEXT.PANELS.JSON_VIEWER_TITLE
      default:
        return UI_TEXT.PANELS.DOCUMENT_VIEWER_TITLE
    }
  }

  const handleStartTranslation = async () => {
    if (!selectedFile || !isFile(selectedFile)) return

    // Log the entire global state for testing
    const currentState = useAppStore.getState()
    console.log('=== GLOBAL STATE BEFORE TRANSLATION ===')
    console.log('Document State:', {
      selectedFile: currentState.selectedFile?.name,
      fileType: currentState.fileType,
      pageCount: currentState.pageCount,
      keyCount: currentState.keyCount,
      isLoading: currentState.isLoading,
    })
    console.log('Translation State:', {
      languageDirection: currentState.languageDirection,
      selectedModel: currentState.selectedModel,
      originalText: currentState.originalText,
      translatedText: currentState.translatedText,
      isTranslating: currentState.isTranslating,
      currentPage: currentState.currentPage,
      totalPages: currentState.totalPages,
      progress: currentState.progress,
    })
    console.log('UI State:', {
      errors: currentState.errors,
      notifications: currentState.notifications,
    })
    console.log('========================================')

    setIsTranslating(true)
    console.log(
      `Starting ${fileType.toUpperCase()} text extraction for:`,
      selectedFile.name,
      'Direction:',
      languageDirection,
      'Model:',
      selectedModel,
    )

    try {
      let extractionResult: {
        success: boolean
        extractedText: string
        pageCount: number
        pages: Array<{ pageNumber: number; text: string }>
      }

      // Route to appropriate processing pipeline based on file type
      if (fileType === 'pdf') {
        extractionResult = await processPDFFile(selectedFile)
      } else if (fileType === 'json') {
        extractionResult = await processJSONFileForTranslation(selectedFile)
      } else {
        throw new Error(`Unsupported file type: ${fileType}`)
      }

      if (extractionResult.success) {
        console.log(`✅ Text extraction completed!`)
        console.log(
          `📄 Content processed: ${extractionResult.pageCount} ${fileType === 'pdf' ? 'pages' : 'structure'}`,
        )
        console.log(
          `📝 Total text length: ${extractionResult.extractedText.length} characters`,
        )

        // Update store with extracted text
        setOriginalText(extractionResult.extractedText)
        if (fileType === 'pdf') {
          setPageCount(extractionResult.pageCount)
        } else if (fileType === 'json') {
          setKeyCount(extractionResult.pageCount) // For JSON, pageCount actually contains keyCount
        }
        setProgress(75) // 75% complete after extraction

        // Stage 3: Translation using selected model
        console.log('[Translation] Starting translation...')

        // Determine language direction
        const sourceLanguage = languageDirection === 'en-to-zh' ? 'en' : 'zh'
        const targetLanguage = languageDirection === 'en-to-zh' ? 'zh' : 'en'

        // Map UI model names to API model names
        const modelMapping = {
          'deepseek-v3': 'deepseek-v3',
        } as const

        const apiModel = modelMapping[selectedModel]

        const translationResult = await translateTextMutation.mutateAsync({
          text: extractionResult.extractedText,
          sourceLanguage,
          targetLanguage,
          model: apiModel,
        })

        if (translationResult.success) {
          console.log(`✅ Translation completed using ${selectedModel}!`)
          console.log(
            `📝 Translated text length: ${translationResult.translatedText.length} characters`,
          )

          // Update store with translated text
          setTranslatedText(translationResult.translatedText)
          setProgress(100) // Complete
        } else {
          throw new Error(translationResult.error || 'Translation failed')
        }
      } else {
        throw new Error('Text extraction failed')
      }
    } catch (error) {
      console.error(
        `[${fileType.toUpperCase()} Translation Pipeline] Failed:`,
        error,
      )
      addError(
        error instanceof Error ? error.message : 'Translation pipeline failed',
      )
      setProgress(0) // Reset progress on error
    } finally {
      setIsTranslating(false)
    }
  }

  // PDF processing pipeline
  const processPDFFile = async (file: File) => {
    // Stage 1: Client-side PDF to images conversion
    console.log('[PDF Stage 1] Converting PDF to images on client-side...')

    const pdfResult = await convertPDFToImages(file, (current, total) => {
      const progressPercent = Math.round((current / total) * 50) // First 50% for PDF processing
      setProgress(progressPercent)
      console.log(
        `[PDF Stage 1] PDF Processing: ${current}/${total} pages (${progressPercent}%)`,
      )
    })

    if (!pdfResult.success) {
      throw new Error(pdfResult.error || 'PDF processing failed')
    }

    console.log(
      `[PDF Stage 1] ✅ PDF converted to ${pdfResult.pageCount} images`,
    )
    setPageCount(pdfResult.pageCount)

    // Stage 2: Server-side text extraction using vision model (batch processing)
    console.log('[PDF Stage 2] Starting batch text extraction...')

    const BATCH_SIZE = 3 // Process 3 pages at a time to avoid payload limits
    const allPages: Array<{ pageNumber: number; text: string }> = []
    const totalBatches = Math.ceil(pdfResult.images.length / BATCH_SIZE)

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * BATCH_SIZE
      const endIndex = Math.min(
        startIndex + BATCH_SIZE,
        pdfResult.images.length,
      )
      const batchImages = pdfResult.images.slice(startIndex, endIndex)

      console.log(
        `[PDF Stage 2] Processing batch ${batchIndex + 1}/${totalBatches} (pages ${startIndex + 1}-${endIndex})...`,
      )

      try {
        const batchResult = await extractTextMutation.mutateAsync({
          type: 'pdf',
          images: batchImages,
          fileName: `${file.name} (batch ${batchIndex + 1})`,
          startPageNumber: startIndex + 1,
        })

        if (batchResult.success) {
          allPages.push(...batchResult.pages)

          // Update progress: 50% for PDF conversion + (batch progress * 25%)
          const batchProgress =
            50 + Math.round(((batchIndex + 1) / totalBatches) * 25)
          setProgress(batchProgress)

          console.log(
            `[PDF Stage 2] Batch ${batchIndex + 1} completed: ${batchResult.pages.length} pages`,
          )
        } else {
          throw new Error(
            batchResult.error || `Batch ${batchIndex + 1} extraction failed`,
          )
        }
      } catch (error) {
        console.error(`[PDF Stage 2] Batch ${batchIndex + 1} failed:`, error)
        // Add error pages for failed batch
        for (let i = startIndex; i < endIndex; i++) {
          allPages.push({
            pageNumber: i + 1,
            text: `[Error extracting text from page ${i + 1}]`,
          })
        }
      }
    }

    // Combine all extracted text
    const combinedText = allPages
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map((page) => `--- Page ${page.pageNumber} ---\n${page.text}`)
      .join('\n\n')

    return {
      success: true,
      extractedText: combinedText,
      pageCount: allPages.length,
      pages: allPages,
    }
  }

  // JSON processing pipeline
  const processJSONFileForTranslation = async (file: File) => {
    console.log('[JSON Stage 1] Processing JSON file on client-side...')
    setProgress(25)

    const jsonResult = await processJSONFile(file)

    if (!jsonResult.success) {
      throw new Error(jsonResult.error || 'JSON processing failed')
    }

    console.log(
      `[JSON Stage 1] ✅ JSON parsed with ${jsonResult.keyCount} translatable keys`,
    )
    setKeyCount(jsonResult.keyCount)
    setProgress(50)

    // Stage 2: Server-side text extraction (direct processing)
    console.log('[JSON Stage 2] Starting text extraction...')

    const extractionResult = await extractTextMutation.mutateAsync({
      type: 'json',
      content: jsonResult.content,
      fileName: file.name,
    })

    if (!extractionResult.success) {
      throw new Error(extractionResult.error || 'JSON text extraction failed')
    }

    console.log(`[JSON Stage 2] ✅ Text extraction completed`)

    return {
      success: true,
      extractedText: extractionResult.extractedText,
      pageCount: jsonResult.keyCount, // Return keyCount as pageCount for consistency
      pages: extractionResult.pages,
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content - Two Column Layout */}
      <main className="flex flex-col lg:flex-row h-screen">
        {/* Left Container - Document Viewer (60% on desktop, full width on mobile) */}
        <div className="w-full lg:w-3/5 lg:border-r border-slate-200 bg-white">
          <div className="h-full p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700">
                {getPanelTitle()}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFileClear}
                disabled={isTranslating}
                className="text-slate-600 hover:text-slate-900"
              >
                Clear
              </Button>
            </div>
            <div className="h-64 lg:h-full">
              {selectedFile &&
              typeof window !== 'undefined' &&
              isFile(selectedFile) ? (
                <DocumentViewer file={selectedFile} />
              ) : (
                <div className="h-full bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-4">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileClear={handleFileClear}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Container - Translation Container */}
        <TranslationContainer
          fileName={selectedFile?.name}
          originalText={originalText}
          translatedText={translatedText}
          isTranslating={isTranslating}
          languageDirection={languageDirection}
          selectedModel={selectedModel}
          selectedFile={selectedFile}
          onLanguageDirectionChange={setLanguageDirection}
          onModelChange={setSelectedModel}
          onStartTranslation={handleStartTranslation}
        />
      </main>
    </div>
  )
}
