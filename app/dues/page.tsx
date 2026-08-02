'use server'

import { auth } from '@/lib/auth'
import { getDues } from '@/app/actions/dues'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DuesForm } from '@/components/dues-form'
import { DuesList } from '@/components/dues-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DuesPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const duesList = await getDues()

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
              <p className="text-muted-foreground">Dues & Bills Tracking</p>
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
            <DuesForm />
          </div>

          {/* Dues List */}
          <div className="lg:col-span-2">
            <DuesList duesList={duesList} />
          </div>
        </div>
      </div>
    </main>
  )
}
