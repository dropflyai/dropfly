/**
 * Upload Zone Component
 *
 * Drag-and-drop file upload with progress indicator,
 * file type validation, and preview thumbnails.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { cn, formatFileSize, isAllowedFileType, generateId } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Upload,
  X,
  FileImage,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// File with upload state
interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

// Allowed file types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadZoneProps {
  onUploadComplete?: (files: File[]) => void;
  maxFiles?: number;
  clientId?: string;
}

export function UploadZone({
  onUploadComplete,
  maxFiles = 10,
  clientId,
}: UploadZoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFiles = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: UploadFile[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Check if we've reached max files
        if (files.length + newFiles.length >= maxFiles) {
          toast.error(`Maximum ${maxFiles} files allowed`);
          break;
        }

        // Validate file type
        if (!isAllowedFileType(file, ALLOWED_TYPES)) {
          toast.error(`${file.name}: Invalid file type. Only images and PDFs allowed.`);
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name}: File too large. Maximum size is 10MB.`);
          continue;
        }

        // Create preview for images
        let preview: string | undefined;
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        }

        newFiles.push({
          id: generateId(),
          file,
          preview,
          progress: 0,
          status: 'pending',
        });
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        // Auto-start uploads
        newFiles.forEach((f) => simulateUpload(f.id));
      }
    },
    [files.length, maxFiles]
  );

  // Simulate file upload (replace with actual upload logic)
  const simulateUpload = async (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: 'uploading' as const } : f
      )
    );

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
      );
    }

    // Simulate occasional errors for demo
    const shouldError = Math.random() < 0.1;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              status: shouldError ? 'error' : 'complete',
              error: shouldError ? 'Upload failed. Please try again.' : undefined,
            }
          : f
      )
    );

    if (!shouldError) {
      const file = files.find((f) => f.id === fileId)?.file;
      if (file && onUploadComplete) {
        onUploadComplete([file]);
      }
    }
  };

  // Remove a file
  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  // Retry failed upload
  const retryUpload = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, status: 'pending' as const, progress: 0, error: undefined }
          : f
      )
    );
    simulateUpload(fileId);
  };

  // Drag handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  // Click handler
  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-neutral-300 hover:border-primary-300 hover:bg-neutral-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div
            className={cn(
              'mb-4 rounded-full p-4 transition-colors',
              isDragging ? 'bg-primary-100' : 'bg-neutral-100'
            )}
          >
            <Upload
              className={cn(
                'h-8 w-8',
                isDragging ? 'text-primary-600' : 'text-neutral-400'
              )}
            />
          </div>
          <p className="text-sm font-medium text-neutral-700">
            {isDragging
              ? 'Drop files here'
              : 'Drag and drop files here, or click to select'}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Images (JPEG, PNG, WebP, HEIC) or PDF, max 10MB each
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                file.status === 'error'
                  ? 'border-error-200 bg-error-50'
                  : 'border-neutral-200 bg-neutral-50'
              )}
            >
              {/* Thumbnail */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 overflow-hidden">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : file.file.type === 'application/pdf' ? (
                  <FileText className="h-6 w-6 text-error-500" />
                ) : (
                  <FileImage className="h-6 w-6 text-neutral-400" />
                )}
              </div>

              {/* File info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {file.file.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatFileSize(file.file.size)}
                </p>

                {/* Progress bar */}
                {file.status === 'uploading' && (
                  <div className="mt-2 h-1 w-full rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {/* Error message */}
                {file.status === 'error' && file.error && (
                  <p className="mt-1 text-xs text-error-600">{file.error}</p>
                )}
              </div>

              {/* Status / Actions */}
              <div className="shrink-0">
                {file.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                )}
                {file.status === 'complete' && (
                  <CheckCircle2 className="h-5 w-5 text-success-500" />
                )}
                {file.status === 'error' && (
                  <button
                    onClick={() => retryUpload(file.id)}
                    className="rounded p-1 text-error-500 transition-colors hover:bg-error-100"
                    title="Retry upload"
                  >
                    <AlertCircle className="h-5 w-5" />
                  </button>
                )}
                {file.status !== 'uploading' && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="ml-2 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File count */}
      {files.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </span>
          <span className="text-neutral-400">
            {files.filter((f) => f.status === 'complete').length} uploaded
          </span>
        </div>
      )}
    </div>
  );
}
