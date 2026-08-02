# Vania Hub - System Architecture

## Data Flow Diagram

```
USER INTERACTION
    ↓
EXPENSE/INCOME FORM (React Component)
    ├── File Upload Input
    │   ↓
    ├── FileUpload Component (/components/file-upload.tsx)
    │   ↓
    ├── POST /api/upload/route.ts
    │   ↓
    ├── uploadToGoogleDrive() (/lib/google-drive.ts)
    │   ├── Reads: GOOGLE_SERVICE_ACCOUNT_EMAIL
    │   ├── Reads: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    │   ├── Reads: GOOGLE_DRIVE_EXPENSE_FOLDER_ID or GOOGLE_DRIVE_INCOME_FOLDER_ID
    │   ├── Creates: /Expenses/YYYY/MM/DD/ or /Income/YYYY/MM/DD/
    │   └── Uploads: File to Google Drive
    │       ↓
    │       Returns: fileId, fileUrl
    │
    └── Form Data + fileId + fileUrl
        ↓
        addExpense() or addIncome() Action (/app/actions/)
        ↓
        Database: expenses or income table
        ├── Stores: drivefileid
        └── Stores: drivefileurl
```

## Component Hierarchy

```
App Root
├── Layout
│   ├── NavSidebar
│   │   └── Links to all pages
│   └── MainContent
│       ├── Page Routes
│       │   ├── Dashboard (/page.tsx)
│       │   ├── Calendar (/calendar/page.tsx)
│       │   ├── Expenses (/expenses/page.tsx)
│       │   │   ├── ExpenseForm (includes FileUpload)
│       │   │   └── ExpenseList
│       │   ├── Income (/income/page.tsx)
│       │   │   ├── IncomeForm (includes FileUpload)
│       │   │   └── IncomeList
│       │   ├── Dues (/dues/page.tsx)
│       │   ├── Maid (/maid/page.tsx)
│       │   ├── Virmanis (/virmanis/page.tsx)
│       │   ├── Analytics (/analytics/page.tsx)
│       │   └── Settings (/settings/page.tsx)
│       └── Shared Components
│           ├── FileUpload (/components/file-upload.tsx)
│           ├── CalendarView (/components/calendar-view.tsx)
│           └── Utility Components
```

## Database Schema

```
expenses table
├── id (primary key)
├── userid (text)
├── date (date)
├── description (text)
├── categorytype (varchar) - 'household' or 'business'
├── category (text)
├── subcategory (text)
├── amount (decimal)
├── paymentmethod (varchar)
├── remarks (text)
├── notes (text)
├── drivefileid (text) ← Google Drive file ID
├── drivefileurl (text) ← Google Drive file URL
├── createdat (timestamp)
└── updatedat (timestamp)

income table
├── id (primary key)
├── userid (text)
├── date (date)
├── description (text)
├── categorytype (varchar) - 'household' or 'business'
├── category (text)
├── subcategory (text)
├── amount (decimal)
├── source (varchar)
├── remarks (text)
├── notes (text)
├── drivefileid (text) ← Google Drive file ID
├── drivefileurl (text) ← Google Drive file URL
├── createdat (timestamp)
└── updatedat (timestamp)

dues table
├── id (primary key)
├── userid (text)
├── date (date)
├── description (text)
├── amount (decimal)
├── status (varchar) - 'pending' or 'paid'
├── paiddate (date)
├── category (text)
├── notes (text)
├── createdat (timestamp)
└── updatedat (timestamp)

maid_attendance table
├── id (primary key)
├── userid (text)
├── date (date)
├── clockintime (timestamp)
├── clockouttime (timestamp)
├── clockedinby (varchar)
├── notes (text)
├── createdat (timestamp)
└── updatedat (timestamp)

virmanis_sales table
├── id (primary key)
├── userid (text)
├── date (date)
├── customername (text)
├── productname (text)
├── quantity (decimal)
├── unitprice (decimal)
├── totalamount (decimal)
├── paymentmethod (varchar)
├── remarks (text)
├── notes (text)
├── createdat (timestamp)
└── updatedat (timestamp)

budget_limits table
├── id (primary key)
├── userid (text)
├── category (text)
├── monthyear (varchar)
├── limitamount (decimal)
├── createdat (timestamp)
└── updatedat (timestamp)
```

## Environment Variables

### Required for Google Drive Integration

```
GOOGLE_SERVICE_ACCOUNT_EMAIL          ← Google Service Account email
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY    ← Google Service Account private key
GOOGLE_DRIVE_EXPENSE_FOLDER_ID        ← Google Drive Expenses folder ID
GOOGLE_DRIVE_INCOME_FOLDER_ID         ← Google Drive Income folder ID
```

### Database Variables (Auto-configured via Neon)

```
DATABASE_URL                  ← Neon database connection string
DATABASE_URL_UNPOOLED         ← Neon unpooled connection
PGHOST, PGUSER, PGPASSWORD    ← PostgreSQL credentials
```

### Other Variables (Pre-configured)

```
BETTER_AUTH_SECRET           ← Authentication secret
NEON_PROJECT_ID              ← Neon project identifier
```

## File Organization in Google Drive

After uploading a receipt on August 2, 2026 at 2:35:20 PM for "Weekly Groceries":

```
Google Drive (familyvania02@gmail.com)
├── Vania Hub - Expenses
│   └── 2026
│       └── 08
│           └── 02
│               └── 2026-08-02_14-35-20_weekly_groceries.jpg
└── Vania Hub - Income
    └── 2026
        └── 08
            └── 02
                └── 2026-08-02_14-35-20_virmanis_united_sale.jpg
```

## Variable Linking Summary

| Component | Uses | Provides | Stores |
|-----------|------|----------|--------|
| ExpenseForm | FileUpload | description, amount | driveFileId, driveFileUrl |
| IncomeForm | FileUpload | description, amount | driveFileId, driveFileUrl |
| FileUpload | API/upload | file, type | (calls backend) |
| /api/upload | google-drive | GOOGLE_DRIVE_*_FOLDER_ID | fileId, fileUrl |
| google-drive | credentials | creates folders, uploads | file link |
| Database | actions | stores all | expenses, income |
| Calendar | database | reads events | displays on calendar |

## Verification Steps

1. ✓ Code is fully integrated and ready
2. ✓ Database schema is configured
3. ✓ API endpoint is set up
4. ⏳ Environment variables need to be added (YOUR NEXT STEP)
5. ⏳ Test uploads to verify integration
