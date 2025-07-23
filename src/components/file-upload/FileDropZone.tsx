import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FILE_UPLOAD_CONFIG, UI_TEXT } from '@/lib/constants'
import type { FileDropZoneProps } from '@/types/file'

export function FileDropZone({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}: FileDropZoneProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: This is a drag-and-drop area with file input
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all w-full
        ${isDragOver ? 'border-jade-500 bg-jade-50' : 'border-slate-300'}
      `}
      role="button"
      tabIndex={0}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Input
        type="file"
        accept={FILE_UPLOAD_CONFIG.ACCEPTED_TYPES.join(',')}
        onChange={onFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="flex flex-col items-center space-y-3 sm:space-y-4">
        <div
          className={`
            p-2 sm:p-3 rounded-full 
            ${isDragOver ? 'bg-jade-100' : 'bg-slate-100'}
          `}
        >
          <Upload
            className={`
              w-6 h-6 sm:w-8 sm:h-8 
              ${isDragOver ? 'text-jade-600' : 'text-slate-500'}
            `}
          />
        </div>

        <div className="px-2">
          <p className="text-base sm:text-lg font-medium text-slate-700">
            {isDragOver
              ? UI_TEXT.UPLOAD.DRAG_DROP_ACTIVE
              : UI_TEXT.UPLOAD.DRAG_DROP_PROMPT}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {UI_TEXT.UPLOAD.BROWSE_INSTRUCTION}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
        >
          {UI_TEXT.UPLOAD.CHOOSE_FILE_BUTTON}
        </Button>
      </div>
    </div>
  )
}
