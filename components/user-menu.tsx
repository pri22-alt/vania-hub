'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function UserMenu({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await authClient.signOut()
    window.location.href = '/sign-in'
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="truncate">{userName}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border z-50">
          <Card className="p-2">
            <p className="text-sm text-muted-foreground px-3 py-2 border-b border-border">
              {userName}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Logout
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
