'use client'

import { AlertCircle, FileText, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  estimatePageCount,
  formatFileSize,
  validateFile,
} from '@/lib/validations'

interface FileUploadProps {
  onFileSelect?: (file: File) => void
  onFileClear?: () => void
}

export function FileUpload({ onFileSelect, onFileClear }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      handleFileAttempt(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      handleFileAttempt(file)
    }
    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  const handleFileAttempt = (file: File) => {
    if (selectedFile) {
      // File already exists, show toast
      showReplaceFileToast(file)
    } else {
      // No file exists, proceed with validation
      handleFileValidation(file)
    }
  }

  const showReplaceFileToast = (newFile: File) => {
    const { dismiss } = toast({
      title: 'File already uploaded',
      description: (
        <div className="space-y-3">
          <p className="text-sm">
            "{selectedFile?.name}" is currently selected. What would you like to
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
              Keep current file
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                handleFileValidation(newFile)
                dismiss()
              }}
              className="w-full bg-jade-600 hover:bg-jade-700"
            >
              Replace with new file
            </Button>
          </div>
        </div>
      ),
    })
  }

  const handleFileValidation = (file: File) => {
    const validation = validateFile(file)

    if (validation.success) {
      setSelectedFile(file)
      setError(null)
      onFileSelect?.(file)
    } else {
      setSelectedFile(null)
      setError(validation.error || 'Invalid file')
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setError(null)
    onFileClear?.()
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
          accept=".pdf"
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
              {isDragOver ? 'Drop your PDF here' : 'Upload PDF file'}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Drag & drop or click to browse (Max 10MB)
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
          >
            Choose File
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
              aria-label="Clear file"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              ✓ File uploaded successfully and ready for processing
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
