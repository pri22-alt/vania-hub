import { getMaidAttendance } from '@/app/actions/maid'
import { MaidForm } from '@/components/maid-form'
import { MaidList } from '@/components/maid-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function MaidPage() {
  const records = await getMaidAttendance()

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <h1 className="text-3xl font-bold text-foreground hover:opacity-80">Vania Hub</h1>
              </Link>
              <p className="text-muted-foreground">Maid Attendance Tracking</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <MaidForm recentAttendance={records[0]} />
          </div>

          {/* Records List */}
          <div className="lg:col-span-2">
            <MaidList records={records} />
          </div>
        </div>
      </div>
    </main>
  )
}
