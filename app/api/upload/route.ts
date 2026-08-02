import { uploadToGoogleDrive } from '@/lib/google-drive'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'expense'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Google Drive
    const { fileId, fileUrl } = await uploadToGoogleDrive(file, type as 'expense' | 'income', file.name)

    return NextResponse.json({
      fileId,
      fileUrl,
      fileName: file.name,
    })
  } catch (error) {
    console.error('[v0] Upload API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
