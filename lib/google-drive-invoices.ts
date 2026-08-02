import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'

const auth = new GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CERT_URL,
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
})

const drive = google.drive({ version: 'v3', auth })

async function ensureInvoiceFolder(clientName: string): Promise<string> {
  // Root Invoices folder
  const invoicesFolders = await drive.files.list({
    q: `name='Invoices' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    spaces: 'drive',
    pageSize: 1,
    fields: 'files(id)',
  })

  let invoicesFolderId: string
  if (invoicesFolders.data.files && invoicesFolders.data.files.length > 0) {
    invoicesFolderId = invoicesFolders.data.files[0].id!
  } else {
    const newFolder = await drive.files.create({
      requestBody: {
        name: 'Invoices',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    })
    invoicesFolderId = newFolder.data.id!
  }

  // Client-specific folder
  const clientFolders = await drive.files.list({
    q: `name='${clientName}' and mimeType='application/vnd.google-apps.folder' and '${invoicesFolderId}' in parents and trashed=false`,
    spaces: 'drive',
    pageSize: 1,
    fields: 'files(id)',
  })

  let clientFolderId: string
  if (clientFolders.data.files && clientFolders.data.files.length > 0) {
    clientFolderId = clientFolders.data.files[0].id!
  } else {
    const newFolder = await drive.files.create({
      requestBody: {
        name: clientName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [invoicesFolderId],
      },
      fields: 'id',
    })
    clientFolderId = newFolder.data.id!
  }

  return clientFolderId
}

export async function uploadInvoiceToDrive(
  pdfBuffer: Buffer,
  invoiceNumber: string,
  clientName: string
): Promise<{ fileId: string; fileUrl: string }> {
  try {
    const clientFolderId = await ensureInvoiceFolder(clientName)

    const fileName = `${invoiceNumber}_${clientName}.pdf`

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/pdf',
        parents: [clientFolderId],
      },
      media: {
        mimeType: 'application/pdf',
        body: require('stream').Readable.from(pdfBuffer),
      },
      fields: 'id, webViewLink',
    })

    const fileId = response.data.id!
    const fileUrl = response.data.webViewLink!

    return { fileId, fileUrl }
  } catch (error) {
    console.error('Error uploading invoice to Google Drive:', error)
    throw error
  }
}
