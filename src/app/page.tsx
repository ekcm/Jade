'use client'

import { FileUpload } from '@/components/FileUpload'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ModelSelect } from '@/components/ModelSelect'
import { PDFViewer } from '@/components/PDFViewer'
import { TranslationArea } from '@/components/TranslationArea'
import { TranslationButton } from '@/components/TranslationButton'
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
    clearPDF,
  } = useAppStore()

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

  const handleStartTranslation = () => {
    if (!selectedFile) return

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
    // TODO: Implement actual translation logic
    console.log(
      'Starting translation for:',
      selectedFile.name,
      'Direction:',
      languageDirection,
      'Model:',
      selectedModel,
    )

    // Simulate translation for now
    setTimeout(() => {
      setIsTranslating(false)
      console.log('Translation completed')
    }, 3000)
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

            {/* Translation Display Area */}
            <TranslationArea
              fileName={selectedFile?.name}
              originalText={originalText}
              translatedText={translatedText}
              isTranslating={isTranslating}
            />

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
