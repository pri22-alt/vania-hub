'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EnvVariablesForm() {
  const [variables, setVariables] = useState({
    email: '',
    privateKey: '',
    expenseFolderId: '',
    incomeFolderId: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [envTemplate, setEnvTemplate] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVariables(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerate = () => {
    if (!variables.email || !variables.privateKey || !variables.expenseFolderId || !variables.incomeFolderId) {
      alert('Please fill in all fields')
      return
    }

    const template = `GOOGLE_SERVICE_ACCOUNT_EMAIL=${variables.email}
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=${variables.privateKey}
GOOGLE_DRIVE_EXPENSE_FOLDER_ID=${variables.expenseFolderId}
GOOGLE_DRIVE_INCOME_FOLDER_ID=${variables.incomeFolderId}`

    setEnvTemplate(template)
    setSubmitted(true)
  }

  const copyTemplate = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(envTemplate)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = envTemplate
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      alert('Copied to clipboard! Paste into Vercel project settings.')
    } catch (err) {
      alert('Could not copy. Please copy manually.')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="font-semibold text-green-900 mb-2">Quick Setup - Paste Your Values</h3>
        <p className="text-sm text-green-800 mb-4">Have your Google Drive credentials? Fill in the fields below and we'll generate your .env file for Vercel.</p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium">Service Account Email</Label>
            <Input
              id="email"
              name="email"
              type="text"
              placeholder="your-account@xxx.iam.gserviceaccount.com"
              value={variables.email}
              onChange={handleChange}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Copy from your Google Cloud JSON key file</p>
          </div>

          <div>
            <Label htmlFor="privateKey" className="text-sm font-medium">Private Key</Label>
            <textarea
              id="privateKey"
              name="privateKey"
              placeholder="-----BEGIN PRIVATE KEY-----
...paste entire key here...
-----END PRIVATE KEY-----"
              value={variables.privateKey}
              onChange={handleChange}
              className="w-full border border-input rounded-md px-3 py-2 text-sm font-mono resize-none"
              rows={5}
            />
            <p className="text-xs text-muted-foreground mt-1">Copy the entire "private_key" value from your JSON key file (include the BEGIN/END lines)</p>
          </div>

          <div>
            <Label htmlFor="expenseFolderId" className="text-sm font-medium">Expense Folder ID</Label>
            <Input
              id="expenseFolderId"
              name="expenseFolderId"
              type="text"
              placeholder="1AbCdEfGhIjKlMnOpQrStUvWxYz123456"
              value={variables.expenseFolderId}
              onChange={handleChange}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">From your "Vania Hub - Expenses" folder URL: drive.google.com/drive/folders/[THIS_ID]</p>
          </div>

          <div>
            <Label htmlFor="incomeFolderId" className="text-sm font-medium">Income Folder ID</Label>
            <Input
              id="incomeFolderId"
              name="incomeFolderId"
              type="text"
              placeholder="1AbCdEfGhIjKlMnOpQrStUvWxYz123456"
              value={variables.incomeFolderId}
              onChange={handleChange}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">From your "Vania Hub - Income" folder URL: drive.google.com/drive/folders/[THIS_ID]</p>
          </div>

          <Button onClick={handleGenerate} className="w-full">
            Generate .env Content
          </Button>
        </div>
      </Card>

      {submitted && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Your Environment Variables</h3>
          <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm overflow-x-auto mb-4">
            <pre>{envTemplate}</pre>
          </div>
          <div className="space-y-3">
            <Button onClick={copyTemplate} className="w-full">
              Copy to Clipboard
            </Button>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Go to Vercel project settings (⚙️ icon in top right)</li>
              <li>Click the <strong>Vars</strong> tab</li>
              <li>Paste each variable into Vercel (one per line)</li>
              <li>Click Save and redeploy</li>
            </ol>
          </div>
        </Card>
      )}
    </div>
  )
}
