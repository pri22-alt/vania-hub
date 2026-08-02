export const dynamic = 'force-dynamic'

import { getMaidAttendance } from '@/app/actions/maid'
import { MaidForm } from '@/components/maid-form'
import { MaidList } from '@/components/maid-list'

export default async function MaidPage() {
  const records = await getMaidAttendance()

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Maid Attendance</h2>
        <p className="text-muted-foreground text-sm mt-1">{records.length} attendance records</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MaidForm />
        </div>
        <div className="lg:col-span-2">
          <MaidList records={records} />
        </div>
      </div>
    </div>
  )
}
