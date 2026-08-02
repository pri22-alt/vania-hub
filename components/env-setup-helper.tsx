'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EnvSetupHelper() {
  const [copied, setCopied] = useState<string | null>(null)
  const [showValues, setShowValues] = useState(false)

  const envVars = [
    {
      name: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      placeholder: 'your-account@xxx.iam.gserviceaccount.com',
      description: 'From your Google Cloud Service Account JSON key',
    },
    {
      name: 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
      placeholder: '-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n',
      description: 'Private key from your JSON file (keep the \\n characters)',
    },
    {
      name: 'GOOGLE_DRIVE_EXPENSE_FOLDER_ID',
      placeholder: '1AbCdEfGhIjKlMnOpQrStUvWxYz123456',
      description: 'Folder ID from your Expenses folder URL',
    },
    {
      name: 'GOOGLE_DRIVE_INCOME_FOLDER_ID',
      placeholder: '1AbCdEfGhIjKlMnOpQrStUvWxYz123456',
      description: 'Folder ID from your Income folder URL',
    },
  ]

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text)
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  const generateEnvFile = () => {
    const template = envVars.map(v => `${v.name}=YOUR_VALUE_HERE`).join('\n')
    copyToClipboard(template, 'env-file')
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Google Drive Setup Instructions</h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console</a></li>
          <li>Create a new project called "Vania Hub"</li>
          <li>Enable the Google Drive API</li>
          <li>Create a Service Account and download the JSON key</li>
          <li>Open the JSON key and copy the values below</li>
          <li>Create two folders in Google Drive: "Vania Hub - Expenses" and "Vania Hub - Income"</li>
          <li>Share both folders with the service account email (give Editor access)</li>
          <li>Copy the folder IDs from the URLs (the long alphanumeric strings)</li>
        </ol>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Environment Variables</h3>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? 'Hide' : 'Show'} Values
          </Button>
        </div>

        <div className="space-y-3">
          {envVars.map((env) => (
            <Card key={env.name} className="p-4">
              <div className="space-y-2">
                <div>
                  <Label className="font-mono text-sm">{env.name}</Label>
                  <p className="text-xs text-muted-foreground mt-1">{env.description}</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded px-3 py-2 font-mono text-xs break-all">
                    {showValues ? env.placeholder : '••••••••••••••••'}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(env.name, env.name)}
                    className="text-xs"
                  >
                    {copied === env.name ? '✓ Copied' : 'Copy Name'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6 bg-amber-50 border-amber-200">
        <h4 className="font-semibold text-amber-900 mb-3">Add to Vercel</h4>
        <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
          <li>Go to your Vercel project settings (click ⚙️ in top right)</li>
          <li>Click <strong>Vars</strong> tab</li>
          <li>For each variable above, add it as an environment variable</li>
          <li>Save and redeploy your app</li>
        </ol>
        <Button 
          onClick={generateEnvFile}
          className="mt-4 w-full"
          variant="outline"
        >
          Copy All Variable Names
        </Button>
      </Card>

      <Card className="p-4 bg-green-50 border-green-200">
        <p className="text-sm text-green-800">
          Once all 4 variables are set in Vercel, your Google Drive integration will be live! Receipt uploads will automatically create folders organized by year, month, and day.
        </p>
      </Card>
    </div>
  )
}
