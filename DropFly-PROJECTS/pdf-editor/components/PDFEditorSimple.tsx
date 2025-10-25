'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb } from 'pdf-lib';
import SignaturePad from 'signature_pad';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFEditorProps {
  file: File;
}

interface Annotation {
  id: string;
  type: 'text' | 'signature';
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  text?: string;
  imageData?: string;
}

export default function PDFEditorSimple({ file }: PDFEditorProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'signature'>('select');
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [pendingSignaturePos, setPendingSignaturePos] = useState<{x: number, y: number} | null>(null);

  // Drag and resize state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Annotations updated:', annotations);
  }, [annotations]);

  useEffect(() => {
    if (showSignatureModal && signatureCanvasRef.current) {
      signaturePadRef.current = new SignaturePad(signatureCanvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
      });
    }
  }, [showSignatureModal]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === 'select') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('PDF clicked at:', x, y, 'tool:', selectedTool);

    if (selectedTool === 'text') {
      // Create text annotation immediately
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
        width: 200,
        height: 50,
        pageNumber: currentPage,
        text: 'Double-click to edit',
      };

      console.log('Creating text annotation:', newAnnotation);
      setAnnotations(prev => {
        const updated = [...prev, newAnnotation];
        console.log('Annotations after adding text:', updated);
        return updated;
      });
      setSelectedTool('select');
    } else if (selectedTool === 'signature') {
      // Store position and open modal
      setPendingSignaturePos({ x, y });
      setShowSignatureModal(true);
    }
  };

  const saveSignature = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty() || !pendingSignaturePos) {
      alert('Please draw a signature first');
      return;
    }

    const imageData = signaturePadRef.current.toDataURL();

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: 'signature',
      x: pendingSignaturePos.x,
      y: pendingSignaturePos.y,
      width: 200,
      height: 100,
      pageNumber: currentPage,
      imageData,
    };

    console.log('Creating signature annotation:', newAnnotation);
    setAnnotations(prev => {
      const updated = [...prev, newAnnotation];
      console.log('Annotations after adding signature:', updated);
      return updated;
    });

    setShowSignatureModal(false);
    setPendingSignaturePos(null);
    setSelectedTool('select');
    if (signaturePadRef.current) signaturePadRef.current.clear();
  };

  const updateAnnotationText = (id: string, text: string) => {
    setAnnotations(prev =>
      prev.map(ann => (ann.id === id ? { ...ann, text } : ann))
    );
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  const startDrag = (e: React.MouseEvent, annId: string, ann: Annotation) => {
    if (selectedTool !== 'select') return;
    e.stopPropagation();
    setDraggingId(annId);
    const rect = pdfContainerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - ann.x,
        y: e.clientY - rect.top - ann.y,
      });
    }
  };

  const startResize = (e: React.MouseEvent, annId: string, ann: Annotation, handle: 'nw' | 'ne' | 'sw' | 'se') => {
    e.stopPropagation();
    setResizingId(annId);
    setResizeHandle(handle);
    setResizeStart({
      x: ann.x,
      y: ann.y,
      width: ann.width,
      height: ann.height,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = pdfContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (draggingId) {
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      setAnnotations(prev =>
        prev.map(ann =>
          ann.id === draggingId ? { ...ann, x, y } : ann
        )
      );
    } else if (resizingId && resizeStart && resizeHandle) {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setAnnotations(prev =>
        prev.map(ann => {
          if (ann.id !== resizingId) return ann;

          let newX = ann.x;
          let newY = ann.y;
          let newWidth = ann.width;
          let newHeight = ann.height;

          if (resizeHandle === 'se') {
            // Southeast - resize from bottom-right
            newWidth = currentX - resizeStart.x;
            newHeight = currentY - resizeStart.y;
          } else if (resizeHandle === 'sw') {
            // Southwest - resize from bottom-left
            newWidth = resizeStart.width - (currentX - resizeStart.x);
            newHeight = currentY - resizeStart.y;
            newX = currentX;
          } else if (resizeHandle === 'ne') {
            // Northeast - resize from top-right
            newWidth = currentX - resizeStart.x;
            newHeight = resizeStart.height - (currentY - resizeStart.y);
            newY = currentY;
          } else if (resizeHandle === 'nw') {
            // Northwest - resize from top-left
            newWidth = resizeStart.width - (currentX - resizeStart.x);
            newHeight = resizeStart.height - (currentY - resizeStart.y);
            newX = currentX;
            newY = currentY;
          }

          // Ensure minimum size
          if (newWidth < 50) {
            if (resizeHandle === 'sw' || resizeHandle === 'nw') {
              newX = resizeStart.x + resizeStart.width - 50;
            }
            newWidth = 50;
          }
          if (newHeight < 30) {
            if (resizeHandle === 'ne' || resizeHandle === 'nw') {
              newY = resizeStart.y + resizeStart.height - 30;
            }
            newHeight = 30;
          }

          return { ...ann, x: newX, y: newY, width: newWidth, height: newHeight };
        })
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setResizingId(null);
    setResizeHandle(null);
    setResizeStart(null);
  };

  const downloadPDF = async () => {
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      for (const annotation of annotations) {
        const page = pages[annotation.pageNumber - 1];
        if (!page) continue;

        const { height } = page.getSize();

        if (annotation.type === 'text' && annotation.text) {
          page.drawText(annotation.text, {
            x: annotation.x,
            y: height - annotation.y - 20,
            size: 16,
            color: rgb(0, 0, 0),
          });
        } else if (annotation.type === 'signature' && annotation.imageData) {
          const imageBytes = Uint8Array.from(
            atob(annotation.imageData.split(',')[1]),
            (c) => c.charCodeAt(0)
          );
          const image = await pdfDoc.embedPng(imageBytes);
          page.drawImage(image, {
            x: annotation.x,
            y: height - annotation.y - annotation.height,
            width: annotation.width,
            height: annotation.height,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited-${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 px-4 py-3 flex gap-4 items-center">
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden inline-flex">
          <button
            onClick={() => setSelectedTool('select')}
            className={`px-4 py-2 text-sm font-medium transition-all border-r border-gray-300 ${
              selectedTool === 'select' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ↖ Select
          </button>
          <button
            onClick={() => setSelectedTool('text')}
            className={`px-4 py-2 text-sm font-medium transition-all border-r border-gray-300 ${
              selectedTool === 'text' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Aa Text
          </button>
          <button
            onClick={() => setSelectedTool('signature')}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              selectedTool === 'signature' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ✍️ Sign
          </button>
        </div>

        <div className="flex-1" />

        <button
          onClick={downloadPDF}
          className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
        >
          📥 Download
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-gray-200 p-8">
        <div
          ref={pdfContainerRef}
          className="relative bg-white shadow-2xl mx-auto w-fit"
          onClick={handlePdfClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: selectedTool !== 'select' ? 'crosshair' : 'default' }}
        >
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={currentPage} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>

          {/* Render Annotations */}
          {annotations
            .filter(ann => ann.pageNumber === currentPage)
            .map(ann => (
              <div
                key={ann.id}
                style={{
                  position: 'absolute',
                  left: ann.x,
                  top: ann.y,
                  width: ann.width,
                  height: ann.height,
                  border: selectedTool === 'select' ? '2px solid rgba(59, 130, 246, 0.8)' : '2px dashed rgba(100, 100, 100, 0.3)',
                  backgroundColor: ann.type === 'text' ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                  cursor: selectedTool === 'select' ? 'move' : 'default',
                  padding: ann.type === 'text' ? '8px' : '0',
                  pointerEvents: 'auto',
                }}
                onMouseDown={(e) => startDrag(e, ann.id, ann)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedTool === 'select') {
                    setSelectedAnnotation(ann.id);
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (ann.type === 'text') {
                    const newText = prompt('Edit text:', ann.text);
                    if (newText !== null) {
                      updateAnnotationText(ann.id, newText);
                    }
                  }
                }}
              >
                {ann.type === 'text' && (
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#000',
                      userSelect: 'none',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}
                  >
                    {ann.text}
                  </div>
                )}
                {ann.type === 'signature' && ann.imageData && (
                  <img
                    src={ann.imageData}
                    alt="Signature"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {selectedTool === 'select' && (
                  <>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnnotation(ann.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                        color: 'white',
                        border: '2px solid white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      ×
                    </button>

                    {/* Resize handles - All 4 corners */}
                    {/* Northwest */}
                    <div
                      onMouseDown={(e) => startResize(e, ann.id, ann, 'nw')}
                      style={{
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        width: 12,
                        height: 12,
                        backgroundColor: '#3B82F6',
                        border: '2px solid white',
                        borderRadius: '50%',
                        cursor: 'nw-resize',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                    {/* Northeast */}
                    <div
                      onMouseDown={(e) => startResize(e, ann.id, ann, 'ne')}
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 12,
                        height: 12,
                        backgroundColor: '#3B82F6',
                        border: '2px solid white',
                        borderRadius: '50%',
                        cursor: 'ne-resize',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                    {/* Southwest */}
                    <div
                      onMouseDown={(e) => startResize(e, ann.id, ann, 'sw')}
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        left: -4,
                        width: 12,
                        height: 12,
                        backgroundColor: '#3B82F6',
                        border: '2px solid white',
                        borderRadius: '50%',
                        cursor: 'sw-resize',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                    {/* Southeast */}
                    <div
                      onMouseDown={(e) => startResize(e, ann.id, ann, 'se')}
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        width: 12,
                        height: 12,
                        backgroundColor: '#3B82F6',
                        border: '2px solid white',
                        borderRadius: '50%',
                        cursor: 'se-resize',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                  </>
                )}
              </div>
            ))}
        </div>

        {/* Debug Info */}
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
          <strong>Debug Info:</strong>
          <div>Current Tool: {selectedTool}</div>
          <div>Total Annotations: {annotations.length}</div>
          <div>Current Page: {currentPage}</div>
          <div>
            Annotations on this page:{' '}
            {annotations.filter(ann => ann.pageNumber === currentPage).length}
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-t border-gray-300 p-3 flex items-center justify-center gap-3">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {numPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
          disabled={currentPage === numPages}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Draw Your Signature</h3>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <canvas ref={signatureCanvasRef} width={700} height={200} className="w-full" />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => signaturePadRef.current?.clear()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setPendingSignaturePos(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
