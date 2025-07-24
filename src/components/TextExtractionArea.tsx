'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface TextExtractionAreaProps {
  originalText?: string
  isExtracting?: boolean
  fileName?: string
}

export function TextExtractionArea({
  originalText,
  isExtracting = false,
  fileName,
}: TextExtractionAreaProps) {
  return (
    <Card className="h-80 flex flex-col p-4 bg-white border-slate-200">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">Original Text</h3>
        {isExtracting && !originalText && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-jade-500 rounded-full animate-pulse" />
            <span className="text-sm text-jade-600">Extracting...</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {isExtracting && !originalText ? (
          // Show skeleton during PDF processing/text extraction
          <div className="h-[120px] flex flex-col justify-start space-y-2 overflow-hidden">
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ) : originalText ? (
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
  )
}
