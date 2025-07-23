'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { PDFViewer } from '@/components/PDFViewer'
import type { SSRFile } from '@/types/file'
import { isFile } from '@/types/file'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<SSRFile | null>(null)

  const handleFileSelect = (file: SSRFile) => {
    if (typeof window !== 'undefined') {
      setSelectedFile(file)
      console.log('File selected:', file.name)
    }
  }

  const handleFileClear = () => {
    setSelectedFile(null)
    if (typeof window !== 'undefined') {
      console.log('File cleared')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content - Two Column Layout */}
      <main className="flex flex-col lg:flex-row h-screen">
        {/* Left Container - PDF Viewer (60% on desktop, full width on mobile) */}
        <div className="w-full lg:w-3/5 lg:border-r border-slate-200 bg-white">
          <div className="h-full p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              PDF Viewer
            </h2>
            <div className="h-64 lg:h-full">
              {selectedFile &&
              typeof window !== 'undefined' &&
              isFile(selectedFile) ? (
                <PDFViewer file={selectedFile} />
              ) : (
                <div className="h-full bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-4">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileClear={handleFileClear}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Container - Translation Area (40% on desktop, full width on mobile) */}
        <div className="w-full lg:w-2/5 bg-slate-50">
          <div className="h-full p-4 lg:p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              Translation
            </h2>

            {/* Translation Display Area */}
            <div className="flex-1 mb-6">
              <div className="h-64 lg:h-full bg-white border border-slate-200 rounded-lg p-4">
                {selectedFile && typeof window !== 'undefined' ? (
                  <div className="h-full flex flex-col">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700">
                        Ready to translate: {selectedFile.name}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-slate-500 text-center">
                        Translation controls and results will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-500 text-center">
                      Upload a PDF to start translation
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Bar Placeholder */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-slate-500 text-sm text-center">
                Translation settings will be here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
