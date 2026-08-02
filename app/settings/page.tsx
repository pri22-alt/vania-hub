export const dynamic = 'force-dynamic'

import { getUsers } from '@/app/actions/settings'
import { UserManager } from '@/components/user-manager'
import { EnvSetupHelper } from '@/components/env-setup-helper'
import { EnvVariablesForm } from '@/components/env-variables-form'

export default async function SettingsPage() {
  const users = await getUsers()

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage users and app configuration</p>
      </div>

      <div className="space-y-12">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">Users</h3>
          <UserManager users={users} />
        </div>

        <hr className="border-border" />

        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">Google Drive Integration Setup</h3>
          <EnvVariablesForm />
        </div>

        <hr className="border-border" />

        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">Detailed Instructions</h3>
          <EnvSetupHelper />
        </div>
      </div>
    </div>
  )
}
