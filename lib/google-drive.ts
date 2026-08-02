import { google } from 'googleapis'
import { Readable } from 'stream'

// Initialize Google Drive API with service account
function getGoogleDriveClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google Drive credentials not configured')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey,
      type: 'service_account',
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  return google.drive({ version: 'v3', auth })
}

// Create folder if it doesn't exist, return folder ID
async function ensureFolder(parentFolderId: string, folderName: string): Promise<string> {
  const drive = getGoogleDriveClient()

  // Search for existing folder
  const response = await drive.files.list({
    q: `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    spaces: 'drive',
    fields: 'files(id)',
    pageSize: 1,
  })

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!
  }

  // Create new folder
  const createResponse = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  })

  return createResponse.data.id!
}

// Create nested folder structure: Year/Month/Day
async function ensureDateFolderStructure(
  rootFolderId: string,
  date: Date
): Promise<string> {
  const year = date.getFullYear().toString()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  let currentFolderId = rootFolderId

  // Create/get year folder
  currentFolderId = await ensureFolder(currentFolderId, year)

  // Create/get month folder
  currentFolderId = await ensureFolder(currentFolderId, `${month} - ${getMonthName(date.getMonth())}`)

  // Create/get day folder
  currentFolderId = await ensureFolder(currentFolderId, day)

  return currentFolderId
}

function getMonthName(monthIndex: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[monthIndex]
}

// Upload file to Google Drive
export async function uploadToGoogleDrive(
  file: File,
  type: 'expense' | 'income',
  description: string
): Promise<{ fileId: string; fileUrl: string }> {
  try {
    const rootFolderId =
      type === 'expense'
        ? process.env.GOOGLE_DRIVE_EXPENSE_FOLDER_ID
        : process.env.GOOGLE_DRIVE_INCOME_FOLDER_ID

    if (!rootFolderId) {
      throw new Error(`Google Drive folder ID for ${type} not configured`)
    }

    // Ensure folder structure exists
    const targetFolderId = await ensureDateFolderStructure(rootFolderId, new Date())

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const sanitizedDescription = description.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const fileName = `${timestamp}_${sanitizedDescription}.${getFileExtension(file.type)}`

    // Convert File to Buffer
    const buffer = await file.arrayBuffer()

    // Upload file
    const drive = getGoogleDriveClient()
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: file.type,
        parents: [targetFolderId],
      },
      media: {
        mimeType: file.type,
        body: Readable.from(Buffer.from(buffer)),
      },
      fields: 'id, webViewLink',
    })

    const fileId = response.data.id!
    const fileUrl = response.data.webViewLink!

    return { fileId, fileUrl }
  } catch (error) {
    console.error('[v0] Google Drive upload error:', error)
    throw new Error(`Failed to upload file to Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function getFileExtension(mimeType: string): string {
  const mimeToExtension: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  }
  return mimeToExtension[mimeType] || 'bin'
}

// Delete file from Google Drive
export async function deleteFromGoogleDrive(fileId: string): Promise<void> {
  try {
    const drive = getGoogleDriveClient()
    await drive.files.delete({
      fileId,
    })
  } catch (error) {
    console.error('[v0] Google Drive delete error:', error)
    throw new Error('Failed to delete file from Google Drive')
  }
}
