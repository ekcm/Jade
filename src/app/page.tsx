'use client'

import { FileUpload } from '@/components/FileUpload'

export default function Home() {
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
            <div className="h-64 lg:h-full bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-4">
              <FileUpload
                onFileSelect={(file) => console.log('File selected:', file)}
                onFileClear={() => console.log('File cleared')}
              />
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
                <p className="text-slate-500 text-center">
                  Translation results will appear here
                </p>
              </div>
            </div>

            {/* Settings Bar Placeholder */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-slate-500 text-sm text-center">
                Settings controls will be here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
