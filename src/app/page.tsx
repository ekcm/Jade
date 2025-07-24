'use client'

import { FileUpload } from '@/components/FileUpload'
import { PDFViewer } from '@/components/PDFViewer'
import { TranslationContainer } from '@/components/TranslationContainer'
import { Button } from '@/components/ui/button'
import { convertPDFToImages } from '@/lib/pdfProcessor'
import { useExtractText, useTranslateText } from '@/lib/queries'
import { useAppStore } from '@/lib/store'
import type { SSRFile } from '@/types/file'
import { isFile } from '@/types/file'

export default function Home() {
  // Get state and actions from Zustand store
  const {
    selectedFile,
    languageDirection,
    selectedModel,
    isTranslating,
    originalText,
    translatedText,
    currentPage,
    totalPages,
    progress,
    setSelectedFile,
    setLanguageDirection,
    setSelectedModel,
    setIsTranslating,
    setOriginalText,
    setTranslatedText,
    setPageCount,
    setCurrentPage,
    setTotalPages,
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

  const handleStartTranslation = async () => {
    if (!selectedFile || !isFile(selectedFile)) return

    // Log the entire global state for testing
    const currentState = useAppStore.getState()
    console.log('=== GLOBAL STATE BEFORE TRANSLATION ===')
    console.log('PDF State:', {
      selectedFile: currentState.selectedFile?.name,
      pageCount: currentState.pageCount,
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
      'Starting PDF text extraction for:',
      selectedFile.name,
      'Direction:',
      languageDirection,
      'Model:',
      selectedModel,
    )

    try {
      // Stage 1: Client-side PDF to images conversion
      console.log('[Stage 1] Converting PDF to images on client-side...')

      const pdfResult = await convertPDFToImages(
        selectedFile,
        (current, total) => {
          const progressPercent = Math.round((current / total) * 50) // First 50% for PDF processing
          setProgress(progressPercent)
          console.log(
            `[Stage 1] PDF Processing: ${current}/${total} pages (${progressPercent}%)`,
          )
        },
      )

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'PDF processing failed')
      }

      console.log(`[Stage 1] ✅ PDF converted to ${pdfResult.pageCount} images`)
      setPageCount(pdfResult.pageCount)

      // Stage 2: Server-side text extraction using vision model (batch processing)
      console.log('[Stage 2] Starting batch text extraction...')

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
          `[Stage 2] Processing batch ${batchIndex + 1}/${totalBatches} (pages ${startIndex + 1}-${endIndex})...`,
        )

        try {
          const batchResult = await extractTextMutation.mutateAsync({
            images: batchImages,
            fileName: `${selectedFile.name} (batch ${batchIndex + 1})`,
          } as any)

          if (batchResult.success) {
            allPages.push(...batchResult.pages)

            // Update progress: 50% for PDF conversion + (batch progress * 25%)
            const batchProgress =
              50 + Math.round(((batchIndex + 1) / totalBatches) * 25)
            setProgress(batchProgress)
            setCurrentPage(endIndex)

            console.log(
              `[Stage 2] Batch ${batchIndex + 1} completed: ${batchResult.pages.length} pages`,
            )
          } else {
            throw new Error(
              batchResult.error || `Batch ${batchIndex + 1} extraction failed`,
            )
          }
        } catch (error) {
          console.error(`[Stage 2] Batch ${batchIndex + 1} failed:`, error)
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

      const extractionResult = {
        success: true,
        extractedText: combinedText,
        pageCount: allPages.length,
        pages: allPages,
      }

      if (extractionResult.success) {
        console.log(`[Stage 2] ✅ Text extraction completed!`)
        console.log(
          `[Stage 2] 📄 Pages processed: ${extractionResult.pageCount}`,
        )
        console.log(
          `[Stage 2] 📝 Total text length: ${extractionResult.extractedText.length} characters`,
        )

        // Update store with extracted text and page count
        setOriginalText(extractionResult.extractedText)
        setPageCount(extractionResult.pageCount)
        setProgress(75) // 75% complete after extraction

        // Log each page's text length for debugging
        extractionResult.pages.forEach((page) => {
          console.log(
            `[Stage 2] Page ${page.pageNumber}: ${page.text.length} characters`,
          )
        })

        // Stage 3: Translation using selected model
        console.log('[Stage 3] Starting translation...')

        // Determine language direction
        const sourceLanguage = languageDirection === 'en-to-zh' ? 'en' : 'zh'
        const targetLanguage = languageDirection === 'en-to-zh' ? 'zh' : 'en'

        // Map UI model names to API model names
        const modelMapping = {
          'qwen2.5-72b': 'qwen2.5-72b',
          'kimi-k2-instruct': 'kimi-k2',
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
          console.log(
            `[Stage 3] ✅ Translation completed using ${selectedModel}!`,
          )
          console.log(
            `[Stage 3] 📝 Translated text length: ${translationResult.translatedText.length} characters`,
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
      console.error('[PDF Translation Pipeline] Failed:', error)
      addError(
        error instanceof Error ? error.message : 'Translation pipeline failed',
      )
      setProgress(0) // Reset progress on error
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content - Two Column Layout */}
      <main className="flex flex-col lg:flex-row h-screen">
        {/* Left Container - PDF Viewer (60% on desktop, full width on mobile) */}
        <div className="w-full lg:w-3/5 lg:border-r border-slate-200 bg-white">
          <div className="h-full p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700">
                PDF Viewer
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
                <PDFViewer file={selectedFile} />
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
          currentPage={currentPage}
          totalPages={totalPages}
          progress={progress}
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
