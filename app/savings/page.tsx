export const dynamic = 'force-dynamic'

import { getSavingsOverview } from '@/app/actions/savings'
import { SavingsClient } from '@/components/savings-client'

export default async function SavingsPage() {
  const savingsData = await getSavingsOverview()

  return <SavingsClient initialData={savingsData} />
}
