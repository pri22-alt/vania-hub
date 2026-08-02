import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavSidebar } from '@/components/nav-sidebar'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vania Hub',
  description: 'Family Home & Business Finance Manager',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.className} antialiased`}>
        <div className="flex flex-col md:flex-row min-h-screen bg-background">
          {/* Navigation */}
          <NavSidebar />
          
          {/* Main Content - Adjusts based on viewport */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden md:ml-56 w-full">
            {children}
          </main>

          {/* Mobile bottom nav safe area padding */}
          <div className="md:hidden h-24" />
        </div>
        <Toaster />
      </body>
    </html>
  )
}
