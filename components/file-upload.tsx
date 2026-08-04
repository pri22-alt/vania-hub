'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  onFileSelect: (file: File | null, url: string | null, fileId: string | null) => void
  disabled?: boolean
  type?: 'expense' | 'income'
}

export function FileUpload({ onFileSelect, disabled, type = 'expense' }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

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
      formData.append('type', type)

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

  const startCamera = async () => {
    try {
      // First, check if we have permission to use the camera
      const permission = await navigator.permissions?.query?.({ name: 'camera' })
      
      if (permission?.state === 'denied') {
        alert('Camera permission is denied. Please enable it in your phone settings under Camera permissions.')
        return
      }

      // Request camera access with constraints
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints as any)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setShowCamera(true)
      }
    } catch (error: any) {
      console.error('[v0] Camera error:', error)
      
      // Provide specific error messages based on the error type
      if (error.name === 'NotAllowedError') {
        alert('Camera permission denied. Please grant camera permission in your device settings to use this feature.')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No camera found on your device.')
      } else if (error.name === 'NotReadableError' || error.name === 'SecurityError') {
        alert('Unable to access camera. It may be in use by another app or you may need to check permissions.')
      } else {
        alert(`Camera error: ${error.message || 'Unable to access camera. Please check permissions.'}`)
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0)

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return

      const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' })
      stopCamera()

      // Upload the captured photo
      try {
        setIsUploading(true)
        setUploadProgress(0)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev))
        }, 200)

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
        onFileSelect(file, data.fileUrl, data.fileId)

        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 1000)
      } catch (error) {
        console.error('[v0] Photo upload error:', error)
        alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setIsUploading(false)
        setUploadProgress(0)
      }
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="flex flex-col gap-3">
      {!showCamera && (
        <div className="flex items-center gap-2 flex-wrap">
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
              <span>{isUploading ? 'Uploading...' : '📎 Upload'}</span>
            </Button>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startCamera}
            disabled={disabled || isUploading}
            className="cursor-pointer"
          >
            📷 Take Photo
          </Button>
        </div>
      )}

      {showCamera && (
        <div className="flex flex-col gap-2 border border-border rounded-lg p-3 bg-muted/30">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto rounded-lg bg-black max-h-64"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={capturePhoto}
              disabled={isUploading}
              className="flex-1"
            >
              📷 Capture
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={stopCamera}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

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
