# Environment Variables Setup Checklist

## Google Drive Integration Setup

Complete these steps in order to enable automatic receipt uploads.

### Step 1: Get Google Cloud Credentials
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project named "Vania Hub"
- [ ] Enable Google Drive API
- [ ] Create Service Account
- [ ] Generate JSON key and download it
- [ ] Extract from JSON key:
  - [ ] **GOOGLE_SERVICE_ACCOUNT_EMAIL** = `client_email` value
  - [ ] **GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY** = `private_key` value

### Step 2: Create Google Drive Folders
Using `familyvania02@gmail.com`:
- [ ] Create folder: "Vania Hub - Expenses"
  - [ ] Copy folder ID: `GOOGLE_DRIVE_EXPENSE_FOLDER_ID`
- [ ] Create folder: "Vania Hub - Income"
  - [ ] Copy folder ID: `GOOGLE_DRIVE_INCOME_FOLDER_ID`

### Step 3: Share Folders with Service Account
- [ ] Share "Vania Hub - Expenses" folder with service account email (give Editor access)
- [ ] Share "Vania Hub - Income" folder with service account email (give Editor access)

### Step 4: Add to Local Development
Edit `.env.development.local`:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@xxx.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_DRIVE_EXPENSE_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz123456
GOOGLE_DRIVE_INCOME_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz123456
```

### Step 5: Add to Vercel Production
Go to Vercel → Settings → Vars:
- [ ] Add `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- [ ] Add `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- [ ] Add `GOOGLE_DRIVE_EXPENSE_FOLDER_ID`
- [ ] Add `GOOGLE_DRIVE_INCOME_FOLDER_ID`

### Step 6: Test the Integration
- [ ] Start dev server: `pnpm dev`
- [ ] Go to Expenses page
- [ ] Try uploading a receipt photo
- [ ] Verify file appears in Google Drive under the correct date folder
- [ ] Check that file URL is stored in the database

## Code Variable Linking (Already Configured ✓)

These are automatically linked in the code:

✓ **API Route** (`/app/api/upload/route.ts`)
  - Receives file upload requests
  - Calls `uploadToGoogleDrive()` function
  - Returns file ID and URL

✓ **Google Drive Service** (`/lib/google-drive.ts`)
  - Reads `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
  - Reads `GOOGLE_DRIVE_EXPENSE_FOLDER_ID` and `GOOGLE_DRIVE_INCOME_FOLDER_ID`
  - Creates automatic folder hierarchy (Year/Month/Day)

✓ **File Upload Component** (`/components/file-upload.tsx`)
  - Calls `/api/upload` endpoint
  - Passes file and type (expense/income)
  - Receives file ID and URL

✓ **Expense Form** (`/components/expense-form.tsx`)
  - Includes `FileUpload` component
  - Stores `driveFileId` and `driveFileUrl` in submission

✓ **Income Form** (`/components/income-form.tsx`)
  - Includes `FileUpload` component
  - Stores `driveFileId` and `driveFileUrl` in submission

✓ **Actions** (`/app/actions/expenses.ts` and `/app/actions/income.ts`)
  - Accept `driveFileId` and `driveFileUrl` parameters
  - Save to database

✓ **Database** (`/lib/db/schema.ts`)
  - Tables have `drivefileid` and `drivefileurl` columns

## Testing Checklist

Once all environment variables are set:

- [ ] Dev server starts without errors
- [ ] Expense form loads with file upload field
- [ ] Income form loads with file upload field
- [ ] Can select a file
- [ ] File uploads and shows progress
- [ ] Success message displays with file link
- [ ] Expense/income entry saves successfully
- [ ] File appears in Google Drive at `/Expenses/2026/08/02/` or `/Income/2026/08/02/`
- [ ] Can click the file link in the app to view in Google Drive
