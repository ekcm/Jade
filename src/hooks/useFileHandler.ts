import { useCallback, useState } from 'react'
import { validateFile } from '@/lib/validations'
import type {
  FileAttemptResult,
  FileHandlerCallbacks,
  SSRFile,
} from '@/types/file'
import { isFile } from '@/types/file'

interface FileHandlerState {
  selectedFile: SSRFile | null
  error: string | null
  isDragOver: boolean
}

export function useFileHandler({
  onFileSelect,
  onFileClear,
}: FileHandlerCallbacks = {}) {
  const [state, setState] = useState<FileHandlerState>({
    selectedFile: null,
    error: null,
    isDragOver: false,
  })

  const setDragOver = useCallback((isDragOver: boolean) => {
    setState((prev) => ({ ...prev, isDragOver }))
  }, [])

  const handleFileValidation = useCallback(
    (file: SSRFile) => {
      if (typeof window === 'undefined' || !isFile(file)) return

      const validation = validateFile(file)

      if (validation.success) {
        setState((prev) => ({
          ...prev,
          selectedFile: file,
          error: null,
        }))
        onFileSelect?.(file)
      } else {
        setState((prev) => ({
          ...prev,
          selectedFile: null,
          error: validation.error || 'Invalid file',
        }))
      }
    },
    [onFileSelect],
  )

  const handleFileAttempt = useCallback(
    (file: SSRFile): FileAttemptResult => {
      if (typeof window === 'undefined') {
        return { hasExistingFile: false as const }
      }

      if (state.selectedFile) {
        // Return info for parent to handle toast
        return {
          hasExistingFile: true as const,
          currentFile: state.selectedFile,
          newFile: file,
          replaceFile: () => handleFileValidation(file),
        }
      } else {
        handleFileValidation(file)
        return { hasExistingFile: false as const }
      }
    },
    [state.selectedFile, handleFileValidation],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(true)
    },
    [setDragOver],
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
    },
    [setDragOver],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent): FileAttemptResult => {
      e.preventDefault()
      setDragOver(false)

      if (typeof window === 'undefined') {
        return { hasExistingFile: false as const }
      }

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0] as SSRFile
        return handleFileAttempt(file)
      }
      return { hasExistingFile: false as const }
    },
    [setDragOver, handleFileAttempt],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): FileAttemptResult => {
      if (typeof window === 'undefined') {
        return { hasExistingFile: false as const }
      }

      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0] as SSRFile
        const result = handleFileAttempt(file)
        // Clear the input so the same file can be selected again
        e.target.value = ''
        return result
      }
      return { hasExistingFile: false as const }
    },
    [handleFileAttempt],
  )

  const handleClearFile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedFile: null,
      error: null,
    }))
    onFileClear?.()
  }, [onFileClear])

  return {
    // State
    selectedFile: state.selectedFile,
    error: state.error,
    isDragOver: state.isDragOver,

    // Event handlers
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleClearFile,

    // Direct actions
    handleFileAttempt,
    handleFileValidation,
  }
}
