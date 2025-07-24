'use client'

import { FileUpload } from '@/components/FileUpload'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ModelSelect } from '@/components/ModelSelect'
import { PDFViewer } from '@/components/PDFViewer'
import { TextExtractionArea } from '@/components/TextExtractionArea'
import { TranslationArea } from '@/components/TranslationArea'
import { TranslationButton } from '@/components/TranslationButton'
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
    setSelectedFile,
    setLanguageDirection,
    setSelectedModel,
    setIsTranslating,
    setOriginalText,
    setTranslatedText,
    setPageCount,
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

      // Stage 2: Server-side text extraction using vision model
      console.log('[Stage 2] Calling vision model for text extraction...')

      const extractionResult = await extractTextMutation.mutateAsync({
        images: pdfResult.images,
        fileName: selectedFile.name,
      })

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
        throw new Error(extractionResult.error || 'Text extraction failed')
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
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              PDF Viewer
            </h2>
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

        {/* Right Container - Translation Area (40% on desktop, full width on mobile) */}
        <div className="w-full lg:w-2/5 bg-slate-50">
          <div className="h-full p-4 lg:p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              Translation
            </h2>

            {/* Text Extraction and Translation Display Areas */}
            <div className="flex-1 space-y-4">
              <TextExtractionArea
                fileName={selectedFile?.name}
                originalText={originalText}
                isExtracting={isTranslating}
              />
              <TranslationArea
                translatedText={translatedText}
                isTranslating={isTranslating}
                hasOriginalText={!!originalText}
              />
            </div>

            {/* Settings Bar */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-6">
                <LanguageToggle
                  direction={languageDirection}
                  onDirectionChange={setLanguageDirection}
                  disabled={!selectedFile || isTranslating}
                />
                <div className="w-40">
                  <ModelSelect
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    disabled={!selectedFile || isTranslating}
                  />
                </div>
                <TranslationButton
                  isTranslating={isTranslating}
                  disabled={!selectedFile}
                  onClick={handleStartTranslation}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
