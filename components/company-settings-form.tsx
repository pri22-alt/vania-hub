'use client'

import { useState } from 'react'
import { updateCompanySettings } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export function CompanySettingsForm({ settings }: { settings: any }) {
  const [formData, setFormData] = useState({
    companyName: settings?.companyName || 'Virmanis United',
    companyEmail: settings?.companyEmail || '',
    companyPhone: settings?.companyPhone || '',
    companyAddress: settings?.companyAddress || '',
    companyCity: settings?.companyCity || '',
    companyCountry: settings?.companyCountry || '',
    taxRate: settings?.taxRate || '0',
    bankDetails: settings?.bankDetails || '',
    notes: settings?.notes || '',
  })
  const [logoPreview, setLogoPreview] = useState(settings?.logoUrl || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string)
        setFormData({ ...formData, logoUrl: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateCompanySettings(formData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Company Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="logo">Company Logo</Label>
          {logoPreview && (
            <div className="mb-3">
              <img src={logoPreview} alt="Logo preview" className="h-20 w-auto rounded" />
            </div>
          )}
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
          <p className="text-xs text-muted-foreground">Upload your company logo (JPG, PNG)</p>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="companyEmail">Email</Label>
            <Input
              id="companyEmail"
              type="email"
              value={formData.companyEmail}
              onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="companyPhone">Phone</Label>
            <Input
              id="companyPhone"
              value={formData.companyPhone}
              onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="companyAddress">Address</Label>
          <Input
            id="companyAddress"
            value={formData.companyAddress}
            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="companyCity">City</Label>
            <Input
              id="companyCity"
              value={formData.companyCity}
              onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="companyCountry">Country</Label>
            <Input
              id="companyCountry"
              value={formData.companyCountry}
              onChange={(e) => setFormData({ ...formData, companyCountry: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="bankDetails">Bank Details</Label>
          <textarea
            id="bankDetails"
            value={formData.bankDetails}
            onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
            className="border border-input rounded-md px-3 py-2 text-sm resize-none"
            rows={3}
            placeholder="Bank account details to display on invoices..."
          />
        </div>

        {success && <p className="text-sm text-green-600">Settings saved successfully!</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </Card>
  )
}
