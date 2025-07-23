import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UI_TEXT } from '@/lib/constants'
import { estimatePageCount, formatFileSize } from '@/lib/validations'
import type { FileDisplayProps } from '@/types/file'

export function FileDisplay({ file, onClear }: FileDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3 p-4 bg-jade-50 border border-jade-200 rounded-lg">
        <FileText className="w-5 h-5 text-jade-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-jade-900">{file.name}</p>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs text-jade-600">{formatFileSize(file.size)}</p>
            <span className="text-jade-400">•</span>
            <p className="text-xs text-jade-600">{file.type || 'PDF'}</p>
            <span className="text-jade-400">•</span>
            <p className="text-xs text-jade-600">
              {estimatePageCount(file.size)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          aria-label={UI_TEXT.UPLOAD.CLEAR_FILE_ARIA}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          {UI_TEXT.UPLOAD.SUCCESS_MESSAGE}
        </p>
      </div>
    </div>
  )
}
