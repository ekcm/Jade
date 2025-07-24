'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface TranslationAreaProps {
  translatedText?: string
  isTranslating?: boolean
  hasOriginalText?: boolean
}

export function TranslationArea({
  translatedText,
  isTranslating = false,
  hasOriginalText = false,
}: TranslationAreaProps) {
  return (
    <Card className="h-80 flex flex-col p-4 bg-white border-slate-200">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">Translation</h3>
        {isTranslating && hasOriginalText && !translatedText && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-jade-500 rounded-full animate-pulse" />
            <span className="text-sm text-jade-600">Translating...</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {isTranslating && hasOriginalText && !translatedText ? (
          // Show skeleton during translation phase (after text extraction is complete)
          <div className="h-[120px] flex flex-col justify-start space-y-2 overflow-hidden">
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ) : translatedText ? (
          <p className="text-sm text-slate-900 whitespace-pre-wrap">
            {translatedText}
          </p>
        ) : (
          <div className="flex items-center justify-center h-[120px]">
            <p className="text-slate-500 text-sm text-center">
              {isTranslating && !hasOriginalText
                ? 'Processing...'
                : 'Translation will appear here'}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
