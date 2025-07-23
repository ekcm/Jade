'use client'

import { AlertCircle, FileText, Upload, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useFileHandler } from '@/hooks/useFileHandler'
import { FILE_UPLOAD_CONFIG, UI_TEXT } from '@/lib/constants'
import { estimatePageCount, formatFileSize } from '@/lib/validations'

interface FileUploadProps {
  onFileSelect?: (file: File) => void
  onFileClear?: () => void
}

export function FileUpload({ onFileSelect, onFileClear }: FileUploadProps) {
  const {
    selectedFile,
    error,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop: hookHandleDrop,
    handleFileChange: hookHandleFileChange,
    handleClearFile,
  } = useFileHandler({ onFileSelect, onFileClear })

  const { toast } = useToast()

  const showReplaceFileToast = (
    currentFile: File,
    _newFile: File,
    replaceFile: () => void,
  ) => {
    const { dismiss } = toast({
      title: UI_TEXT.TOAST.FILE_ALREADY_UPLOADED_TITLE,
      description: (
        <div className="space-y-3">
          <p className="text-sm">
            "{currentFile.name}" is currently selected. What would you like to
            do?
          </p>
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                dismiss()
              }}
              className="w-full"
            >
              {UI_TEXT.TOAST.KEEP_CURRENT_FILE}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                replaceFile()
                dismiss()
              }}
              className="w-full bg-jade-600 hover:bg-jade-700"
            >
              {UI_TEXT.TOAST.REPLACE_WITH_NEW_FILE}
            </Button>
          </div>
        </div>
      ),
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    const result = hookHandleDrop(e)
    if (result.hasExistingFile) {
      showReplaceFileToast(
        result.currentFile,
        result.newFile,
        result.replaceFile,
      )
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = hookHandleFileChange(e)
    if (result.hasExistingFile) {
      showReplaceFileToast(
        result.currentFile,
        result.newFile,
        result.replaceFile,
      )
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Drag & Drop Area */}
      {/* biome-ignore lint/a11y/useSemanticElements: This is a drag-and-drop area with file input */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all w-full
          ${isDragOver ? 'border-jade-500 bg-jade-50' : 'border-slate-300'}
        `}
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input
          type="file"
          accept={FILE_UPLOAD_CONFIG.ACCEPTED_TYPES.join(',')}
          onChange={handleFileChange}
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

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selected File Info */}
      {selectedFile && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-4 bg-jade-50 border border-jade-200 rounded-lg">
            <FileText className="w-5 h-5 text-jade-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-jade-900">
                {selectedFile.name}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-jade-600">
                  {formatFileSize(selectedFile.size)}
                </p>
                <span className="text-jade-400">•</span>
                <p className="text-xs text-jade-600">
                  {selectedFile.type || 'PDF'}
                </p>
                <span className="text-jade-400">•</span>
                <p className="text-xs text-jade-600">
                  {estimatePageCount(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFile}
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
      )}
    </div>
  )
}
