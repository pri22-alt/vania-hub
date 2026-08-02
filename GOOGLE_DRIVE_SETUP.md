# Google Drive Integration Setup Guide

Follow these steps to get all the credentials needed for automatic receipt uploads.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Name it "Vania Hub" or similar
5. Click CREATE
6. Wait for the project to be created, then select it

## Step 2: Enable Google Drive API

1. In the left sidebar, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "ENABLE"
4. Wait for it to enable (about 30 seconds)

## Step 3: Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" button at the top
3. Select "Service Account"
4. Fill in the details:
   - Service account name: "Vania Hub"
   - Service account ID: (auto-filled, keep as is)
   - Click "CREATE AND CONTINUE"
5. Grant basic roles (optional - click "CONTINUE" to skip)
6. Click "DONE"

## Step 4: Generate Private Key

1. In "APIs & Services" > "Credentials", find your service account under "Service Accounts"
2. Click on the service account email
3. Go to the "KEYS" tab
4. Click "ADD KEY" > "Create new key"
5. Choose "JSON" format
6. Click "CREATE"
7. A JSON file will download - **keep this safe!**

From this JSON file, extract:
- **GOOGLE_SERVICE_ACCOUNT_EMAIL**: The `client_email` value (looks like: `xxx@xxx.iam.gserviceaccount.com`)
- **GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY**: The `private_key` value (long string starting with `-----BEGIN PRIVATE KEY-----`)

## Step 5: Create Google Drive Folders

1. Go to [Google Drive](https://drive.google.com/)
2. Create a folder named "Vania Hub - Expenses"
3. Create another folder named "Vania Hub - Income"
4. Open each folder and copy the folder ID from the URL

   For example, if the URL is:
   ```
   https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz123456
   ```
   The folder ID is: `1AbCdEfGhIjKlMnOpQrStUvWxYz123456`

- **GOOGLE_DRIVE_EXPENSE_FOLDER_ID**: ID of the Expenses folder
- **GOOGLE_DRIVE_INCOME_FOLDER_ID**: ID of the Income folder

## Step 6: Share Folders with Service Account

1. Open the Expenses folder
2. Click "Share"
3. Paste the service account email from Step 4
4. Give it "Editor" access
5. Click "Share"
6. Repeat for the Income folder

## Step 7: Add Environment Variables

In your Vercel project settings (or `.env.local` for local development), add:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@xxx.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_DRIVE_EXPENSE_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz123456
GOOGLE_DRIVE_INCOME_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz123456
```

**Note:** For the private key in environment variables, replace actual newlines with `\n` in the string.

## Done!

Your Google Drive integration is now configured. The app will:
- Create automatic folder structure: `Expenses/2026/08/02/` and `Income/2026/08/02/`
- Upload receipt photos when you submit expense or income entries
- Store file links in the app database for easy access

## Troubleshooting

**"Permission denied" errors:**
- Make sure the service account has Editor access to both folders
- Check that the folder IDs are correct

**"Invalid credentials" errors:**
- Verify the private key format (should start with `-----BEGIN PRIVATE KEY-----`)
- Check that the service account email is correct

**Folders not created automatically:**
- The first upload might take a moment to create the folder structure
- Check Google Drive to see if folders are being created
