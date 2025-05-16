'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onFileChange: (file: File | null) => void
  file: File | null
  accept?: Record<string, string[]>
  maxSize?: number
}

export function FileUpload({
  onFileChange,
  file,
  accept = { 'application/pdf': [] },
  maxSize = 5 * 1024 * 1024 // 5MB default
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) onFileChange(acceptedFiles[0])
    },
    [onFileChange]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    maxSize
  })

  const hasError = fileRejections.length > 0

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg transition-colors cursor-pointer flex flex-col items-center justify-center py-8 px-4',
        isDragActive ? 'border-pink-400 bg-pink-50' : 'border-gray-300',
        hasError && 'border-red-400 bg-red-50',
        file && !hasError && 'border-green-400 bg-green-50'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center text-center">
        {file ? (
          <>
            <div className="size-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFileChange(null)
              }}
              className="mt-2 text-xs text-pink-500 hover:text-pink-700 font-medium"
            >
              Cambiar archivo
            </button>
          </>
        ) : (
          <>
            <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Upload className="size-6 text-gray-500" />
            </div>
            <p className="text-sm font-medium">
              {hasError ? 'Archivo no válido' : 'Click para subir'}
            </p>
            <p className="text-xs text-gray-500 mt-1">o arrastra y suelta tu PDF aquí</p>
            <p className="text-xs text-gray-400 mt-2">PDF (Máx. {maxSize / 1024 / 1024} MB)</p>
            {hasError && (
              <p className="text-xs text-red-500 mt-2">
                {fileRejections[0]?.errors[0]?.message || 'Archivo no válido'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
