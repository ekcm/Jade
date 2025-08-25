'use client'

import { AlertCircle, FileJson, Loader2, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'

interface JSONViewerProps {
  file: File | null
  className?: string
}

export function JSONViewer({ file, className = '' }: JSONViewerProps) {
  const [jsonText, setJsonText] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Parse and format JSON file
  const parseJSON = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      // Format JSON with 2-space indentation
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonText(formatted)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format')
      setJsonText('')
    }
  }, [])

  // Handle file changes
  useEffect(() => {
    if (!file) {
      setJsonText('')
      setError(null)
      return
    }

    setIsLoading(true)
    parseJSON(file).finally(() => setIsLoading(false))
  }, [file, parseJSON])

  // No need for separate filtered text handling since we're not highlighting

  // Count search matches
  const matchCount =
    searchTerm && jsonText
      ? (
          jsonText.match(
            new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
          ) || []
        ).length
      : 0

  // Empty state
  if (!file) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg ${className}`}
      >
        <FileJson className="w-12 h-12 text-slate-400 mb-4" />
        <p className="text-slate-500 text-center">
          Upload a JSON file to view it here
        </p>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full bg-slate-50 border border-slate-200 rounded-lg ${className}`}
      >
        <Loader2 className="w-8 h-8 text-jade-600 animate-spin mb-4" />
        <p className="text-slate-600">Loading JSON...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to parse JSON: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Main content
  return (
    <div
      className={`h-full bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col ${className}`}
    >
      {/* Search bar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            type="text"
            placeholder="Search JSON content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        {searchTerm && (
          <p className="text-xs text-slate-500 mt-2">
            {matchCount} matches found
          </p>
        )}
      </div>

      {/* JSON text view */}
      <div className="flex-1 overflow-auto font-mono text-sm bg-slate-50">
        <pre className="p-4 whitespace-pre-wrap text-slate-800 leading-relaxed">
          {jsonText}
        </pre>
      </div>

      {/* File info footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
        <div className="flex justify-between items-center">
          <span>{file.name}</span>
          <span>{(file.size / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </div>
  )
}
