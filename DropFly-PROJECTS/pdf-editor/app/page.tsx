'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const PDFEditor = dynamic(() => import('@/components/PDFEditorSimple'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading PDF Doc Sign...</div>
});

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // For iOS Capacitor compatibility, we need to ensure the file is fully readable
      // Convert to Blob with arrayBuffer to ensure it's accessible
      try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const processedFile = new File([blob], file.name, { type: 'application/pdf' });
        setPdfFile(processedFile);
      } catch (error) {
        console.error('Error processing PDF file:', error);
        alert('Failed to load PDF. Please try again.');
      }
    }
  };

  const handleReset = () => {
    setPdfFile(null);
  };

  const handleTestW9 = async () => {
    try {
      const response = await fetch('/test-w9.pdf');
      const blob = await response.blob();
      const file = new File([blob], 'test-w9.pdf', { type: 'application/pdf' });
      setPdfFile(file);
    } catch (error) {
      console.error('Error loading test W9:', error);
      alert('Failed to load test PDF');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      // For iOS Capacitor compatibility, process the file
      try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const processedFile = new File([blob], file.name, { type: 'application/pdf' });
        setPdfFile(processedFile);
      } catch (error) {
        console.error('Error processing PDF file:', error);
        alert('Failed to load PDF. Please try again.');
      }
    } else if (file) {
      alert('Please upload a PDF file');
    }
  };

  return (
    <main className="mobile-viewport bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30">
      {!pdfFile ? (
        <div className="mobile-viewport flex flex-col">
          {/* Minimal Header with Safe Area */}
          <header className="safe-area-top border-b border-slate-100/50 bg-white/70 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-base font-medium text-slate-900 tracking-tight">PDF Doc Sign</h1>
              </div>
              <button
                onClick={handleTestW9}
                className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Test W9
              </button>
            </div>
          </header>

          {/* Centered Content */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-16 safe-area-bottom">
            <div className="w-full max-w-2xl">

              {/* Hero Section */}
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2 sm:mb-3 tracking-tight px-2">
                  Edit PDFs with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-normal">ease</span>
                </h2>
                <p className="text-sm text-slate-500 font-light px-2">
                  Simple, secure, and private PDF editing in your browser
                </p>
              </div>

              {/* Drag & Drop Zone - Main Focus */}
              <div className="mb-8">
                <label
                  htmlFor="pdf-upload"
                  className={`block relative cursor-pointer ${
                    isDragging ? 'scale-[1.02]' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className={`bg-white rounded-2xl border-2 border-dashed p-8 sm:p-16 text-center transition-all duration-300 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-2xl shadow-indigo-200/50'
                      : 'border-slate-200 shadow-sm'
                  }`}>
                    <div className="w-14 h-14 mx-auto mb-5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium text-slate-900 mb-2">
                      Drop your PDF here
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      or click to browse
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Open PDF
                    </div>
                  </div>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Minimal Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-slate-100/50">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-medium text-slate-700 mb-1">Sign</h3>
                  <p className="text-xs text-slate-900 font-normal leading-relaxed">Draw and place your signature anywhere on the document</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-medium text-slate-700 mb-1">Edit</h3>
                  <p className="text-xs text-slate-900 font-normal leading-relaxed">Fill out forms and edit text fields with ease</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-medium text-slate-700 mb-1">Private</h3>
                  <p className="text-xs text-slate-900 font-normal leading-relaxed">All editing happens in your browser, nothing is uploaded</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="mobile-viewport flex flex-col">
          <PDFEditor file={pdfFile} onReset={handleReset} />
        </div>
      )}
    </main>
  );
}
