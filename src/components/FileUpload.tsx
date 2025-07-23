'use client'

import { AlertCircle, FileText, Upload } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatFileSize, validateFile } from '@/lib/validations'

interface FileUploadProps {
  onFileSelect?: (file: File) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      handleFileValidation(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      handleFileValidation(file)
    }
    // Clear the input so the same file can be selected again
    e.target.value = ''
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
        <div className="flex items-center space-x-3 p-4 bg-jade-50 border border-jade-200 rounded-lg">
          <FileText className="w-5 h-5 text-jade-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-jade-900">
              {selectedFile.name}
            </p>
            <p className="text-xs text-jade-600">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
