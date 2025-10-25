'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const PDFEditor = dynamic(() => import('@/components/PDFEditorSimple'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading PDF editor...</div>
});

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else if (file) {
      alert('Please upload a PDF file');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {!pdfFile ? (
        <div className="min-h-screen">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">📄</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">PDF Editor</h1>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Help
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Quick Actions */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Get Started</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Open File */}
                <label
                  htmlFor="pdf-upload"
                  className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Open PDF</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Edit and sign existing PDF documents
                  </p>
                  <div className="text-blue-500 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-block">
                    Browse files →
                  </div>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Create New */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-green-500 hover:shadow-xl transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Create New</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Start with a blank PDF document
                  </p>
                  <div className="text-green-500 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-block">
                    Coming soon →
                  </div>
                </div>

                {/* Templates */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-purple-500 hover:shadow-xl transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Templates</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Choose from professional templates
                  </p>
                  <div className="text-purple-500 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-block">
                    Coming soon →
                  </div>
                </div>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div className="mb-12">
              <div
                className={`bg-white rounded-2xl border-3 border-dashed p-16 text-center transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Drop your PDF here
                </h3>
                <p className="text-gray-500">
                  or click "Open PDF" above to browse files
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✍️</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Sign Documents</h3>
                <p className="text-sm text-gray-600">Draw, type, or upload your signature</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Add Text & Annotations</h3>
                <p className="text-sm text-gray-600">Highlight, comment, and edit text</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">100% Private</h3>
                <p className="text-sm text-gray-600">All editing happens in your browser</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col">
          <PDFEditor file={pdfFile} />
        </div>
      )}
    </main>
  );
}
