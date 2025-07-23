/**
 * File-related type definitions that work in both client and server environments
 */

// Define File-like interface for server compatibility
export interface FileData {
  name: string
  size: number
  type: string
  lastModified?: number
}

// File validation result types
export interface FileValidationSuccess {
  success: true
  data: { file: File }
}

export interface FileValidationError {
  success: false
  error: string
}

export type FileValidationResult = FileValidationSuccess | FileValidationError

// File upload state interface
export interface FileUploadState {
  file: File | null
  error: string | null
  isUploading: boolean
  uploadProgress: number
}

// File handler return types for discriminated unions
export interface FileAttemptWithExisting {
  hasExistingFile: true
  currentFile: File
  newFile: File
  replaceFile: () => void
}

export interface FileAttemptWithoutExisting {
  hasExistingFile: false
}

export type FileAttemptResult =
  | FileAttemptWithExisting
  | FileAttemptWithoutExisting

// Component prop types
export interface FileHandlerCallbacks {
  onFileSelect?: (file: File) => void
  onFileClear?: () => void
}

export interface FileDropZoneProps {
  isDragOver: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface FileDisplayProps {
  file: File
  onClear: () => void
}

export interface FileUploadErrorProps {
  error: string
}

export interface FileUploadProps {
  onFileSelect?: (file: File) => void
  onFileClear?: () => void
}
