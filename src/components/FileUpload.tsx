'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useFileHandler } from '@/hooks/useFileHandler'
import { UI_TEXT } from '@/lib/constants'
import type { FileUploadProps } from '@/types/file'
import { FileDisplay, FileDropZone, FileUploadError } from './file-upload'

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
      <FileDropZone
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileChange={handleFileChange}
      />

      {error && <FileUploadError error={error} />}

      {selectedFile && (
        <FileDisplay file={selectedFile} onClear={handleClearFile} />
      )}
    </div>
  )
}
