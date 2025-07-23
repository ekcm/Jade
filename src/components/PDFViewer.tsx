'use client'

import { AlertCircle, FileText, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PDFViewerProps {
  file: File | null
  className?: string
}

export function PDFViewer({ file, className = '' }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPdfUrl(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create object URL for the PDF file
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
      setIsLoading(false)

      // Cleanup function to revoke object URL
      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (_err) {
      setError('Failed to load PDF file')
      setIsLoading(false)
    }
  }, [file])

  if (!file) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg ${className}`}
      >
        <FileText className="w-12 h-12 text-slate-400 mb-4" />
        <p className="text-slate-500 text-center">
          Upload a PDF file to view it here
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full bg-slate-50 border border-slate-200 rounded-lg ${className}`}
      >
        <Loader2 className="w-8 h-8 text-jade-600 animate-spin mb-4" />
        <p className="text-slate-600">Loading PDF...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div
      className={`h-full bg-white border border-slate-200 rounded-lg overflow-hidden ${className}`}
    >
      {pdfUrl && (
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          className="w-full h-full border-0"
          title={`PDF Viewer - ${file.name}`}
          onError={() =>
            setError(
              'Failed to display PDF. This file may be corrupted or password-protected.',
            )
          }
        >
          <p className="p-4 text-slate-600">
            Your browser doesn't support PDF viewing.
            <a
              href={pdfUrl}
              download={file.name}
              className="text-jade-600 hover:text-jade-700 underline ml-1"
            >
              Download the PDF
            </a>
            to view it.
          </p>
        </iframe>
      )}
    </div>
  )
}
