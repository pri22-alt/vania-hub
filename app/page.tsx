export const dynamic = 'force-dynamic'

import { getFinancialOverview } from '@/app/actions/analytics'
import { getDues } from '@/app/actions/dues'
import { DashboardClient } from '@/components/dashboard-client'

export default async function DashboardPage() {
  const [overview, allDues] = await Promise.all([
    getFinancialOverview(),
    getDues(),
  ])

  return <DashboardClient initialOverview={overview} initialDues={allDues} />
}
