'use client'

import { getFileType } from '@/lib/validations'
import type { SSRFile } from '@/types/file'
import { isFile } from '@/types/file'
import { JSONViewer } from './JSONViewer'
import { PDFViewer } from './PDFViewer'

interface DocumentViewerProps {
  file: SSRFile | null
  className?: string
}

export function DocumentViewer({ file, className = '' }: DocumentViewerProps) {
  // Early return for null file
  if (!file || !isFile(file)) {
    return <PDFViewer file={null} className={className} />
  }

  // Determine file type and route to appropriate viewer
  const fileType = getFileType(file)

  switch (fileType) {
    case 'pdf':
      return <PDFViewer file={file} className={className} />
    case 'json':
      return <JSONViewer file={file} className={className} />
    default:
      // Fallback to PDF viewer for unknown types (will show error)
      return <PDFViewer file={file} className={className} />
  }
}
