'use client'

import { Card } from '@/components/ui/card'

interface TranslationAreaProps {
  originalText?: string
  translatedText?: string
  isTranslating?: boolean
  fileName?: string
}

export function TranslationArea({
  originalText,
  translatedText,
  isTranslating = false,
  fileName,
}: TranslationAreaProps) {
  return (
    <div className="flex-1 space-y-4">
      {/* Original Text Section */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-slate-700">Original Text</h3>
        </div>
        <div className="min-h-[120px] max-h-[200px] overflow-y-auto">
          {originalText ? (
            <p className="text-sm text-slate-900 whitespace-pre-wrap">
              {originalText}
            </p>
          ) : (
            <div className="flex items-center justify-center h-[120px]">
              <p className="text-slate-500 text-sm text-center">
                {fileName
                  ? `Ready to extract text from ${fileName}`
                  : 'Upload a PDF to extract text'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Translated Text Section */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-700">Translation</h3>
          {isTranslating && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-jade-500 rounded-full animate-pulse" />
              <span className="text-sm text-jade-600">Translating...</span>
            </div>
          )}
        </div>
        <div className="min-h-[120px] max-h-[200px] overflow-y-auto">
          {translatedText ? (
            <p className="text-sm text-slate-900 whitespace-pre-wrap">
              {translatedText}
            </p>
          ) : (
            <div className="flex items-center justify-center h-[120px]">
              <p className="text-slate-500 text-sm text-center">
                {isTranslating
                  ? 'Translation in progress...'
                  : 'Translation will appear here'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
