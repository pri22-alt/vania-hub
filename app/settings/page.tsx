export const dynamic = 'force-dynamic'

import { getUsers } from '@/app/actions/settings'
import { getCompanySettings } from '@/app/actions/invoices'
import { UserManager } from '@/components/user-manager'
import { CompanySettingsForm } from '@/components/company-settings-form'

export default async function SettingsPage() {
  const users = await getUsers()
  const companySettings = await getCompanySettings()

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage application configuration and business settings</p>
      </div>

      <div className="space-y-12">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">Users</h3>
          <UserManager users={users} />
        </div>

        <hr className="border-border" />

        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">Company Settings</h3>
          <p className="text-muted-foreground text-sm mb-4">Configure company branding, contact details, and tax settings for invoice generation</p>
          <CompanySettingsForm settings={companySettings} />
        </div>
      </div>
    </div>
  )
}
