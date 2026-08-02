'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  onFileSelect: (file: File | null, url: string | null, fileId: string | null) => void
  disabled?: boolean
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      alert('Only images (JPG, PNG, GIF, WebP) and PDF files are allowed')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev))
      }, 200)

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      setUploadProgress(100)
      setUploadedFile({ name: file.name, url: data.fileUrl })

      // Call parent callback with file, URL, and file ID
      onFileSelect(file, data.fileUrl, data.fileId)

      // Reset after showing completion
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1000)
    } catch (error) {
      console.error('[v0] File upload error:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    onFileSelect(null, null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            className="cursor-pointer"
          >
            <span>{isUploading ? 'Uploading...' : '📎 Attach Receipt'}</span>
          </Button>
        </label>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
        </div>
      )}

      {uploadedFile && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-green-700">✓ Uploaded:</span>
            <a
              href={uploadedFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:underline truncate"
              title={uploadedFile.name}
            >
              {uploadedFile.name}
            </a>
          </div>
          <button
            onClick={handleRemoveFile}
            className="text-green-600 hover:text-green-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        JPG, PNG, GIF, WebP or PDF • Max 10MB
      </p>
    </div>
  )
}
