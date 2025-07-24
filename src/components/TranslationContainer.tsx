'use client'

import type { LanguageDirection } from '@/components/LanguageToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import type { TranslationModel } from '@/components/ModelSelect'
import { ModelSelect } from '@/components/ModelSelect'
import { TextExtractionArea } from '@/components/TextExtractionArea'
import { TranslationArea } from '@/components/TranslationArea'
import { TranslationButton } from '@/components/TranslationButton'
import type { SSRFile } from '@/types/file'

interface TranslationContainerProps {
  // File and text data
  fileName?: string
  originalText?: string
  translatedText?: string

  // State
  isTranslating?: boolean

  // Settings
  languageDirection: LanguageDirection
  selectedModel: TranslationModel
  selectedFile: SSRFile | null

  // Callbacks
  onLanguageDirectionChange: (direction: LanguageDirection) => void
  onModelChange: (model: TranslationModel) => void
  onStartTranslation: () => void
}

export function TranslationContainer({
  fileName,
  originalText,
  translatedText,
  isTranslating = false,
  languageDirection,
  selectedModel,
  selectedFile,
  onLanguageDirectionChange,
  onModelChange,
  onStartTranslation,
}: TranslationContainerProps) {
  return (
    <div className="w-full lg:w-2/5 bg-slate-50">
      <div className="h-full p-4 lg:p-6 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Translation
        </h2>

        {/* Text Extraction and Translation Display Areas */}
        <div className="flex-1 space-y-4">
          <TextExtractionArea
            fileName={fileName}
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
              onDirectionChange={onLanguageDirectionChange}
              disabled={!selectedFile || isTranslating}
            />
            <div className="w-40">
              <ModelSelect
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                disabled={!selectedFile || isTranslating}
              />
            </div>
            <TranslationButton
              isTranslating={isTranslating}
              disabled={!selectedFile}
              onClick={onStartTranslation}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
