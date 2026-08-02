export const dynamic = 'force-dynamic'

import { getUsers } from '@/app/actions/settings'
import { UserManager } from '@/components/user-manager'

export default async function SettingsPage() {
  const users = await getUsers()

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage users and app configuration</p>
      </div>

      <UserManager users={users} />
    </div>
  )
}
