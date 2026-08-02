'use client'

export function GoogleDriveGuide() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <p className="font-semibold text-blue-900 text-sm mb-2">📁 Photo Storage on Google Drive</p>
      <p className="text-sm text-blue-800 mb-3">
        Photos, receipts, and supporting documents should be stored in Google Drive. Here&apos;s how to set it up:
      </p>
      <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
        <li>Create a folder in your Google Drive called &quot;Vania Hub Receipts&quot; or similar</li>
        <li>When adding an expense, paste the link to the Google Drive folder or specific file in the &quot;Remarks&quot; field</li>
        <li>Example format: <code className="bg-white px-2 py-0.5 rounded text-xs">drive.google.com/drive/folders/...</code></li>
        <li>You can also use Google Forms to collect receipts with photos (upload form link in remarks)</li>
      </ol>
      <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
        <strong>Pro tip:</strong> Share your Google Drive folder with family members who need to submit receipts or photos
      </div>
    </div>
  )
}
