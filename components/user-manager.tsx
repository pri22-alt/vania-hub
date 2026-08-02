'use client'

import { useState } from 'react'
import { createUser, deleteUser, resetUserPassword } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  name: string | null
  email: string
  createdAt: Date
}

export function UserManager({ users }: { users: User[] }) {
  const [showForm, setShowForm] = useState(false)
  const [resetId, setResetId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await createUser(form)
      setSuccess(`User ${form.email} created successfully.`)
      setForm({ name: '', email: '', password: '' })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return
    setError(null)
    try {
      await deleteUser(id)
      setSuccess(`User ${email} deleted.`)
    } catch {
      setError('Failed to delete user.')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetId || !newPassword) return
    setError(null)
    setLoading(true)
    try {
      await resetUserPassword(resetId, newPassword)
      setSuccess('Password updated successfully.')
      setResetId(null)
      setNewPassword('')
    } catch {
      setError('Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Users Section */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Users</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
          </div>
          <Button size="sm" onClick={() => { setShowForm(!showForm); setError(null) }}>
            {showForm ? 'Cancel' : '+ Add User'}
          </Button>
        </div>

        {/* Feedback */}
        {error && <p className="text-sm text-destructive mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-sm text-emerald-700 mb-3 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{success}</p>}

        {/* Add User Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="mb-5 p-4 bg-muted/50 rounded-lg flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">New User</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-xs">Full Name</Label>
                <Input id="name" placeholder="e.g. Priyanka" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input id="password" type="password" placeholder="Min 8 chars" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
              </div>
            </div>
            <Button type="submit" size="sm" disabled={loading} className="self-start">
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        )}

        {/* Users Table */}
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No users yet. Add one above.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{u.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {resetId === u.id ? (
                    <form onSubmit={handleResetPassword} className="flex items-center gap-2">
                      <Input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="h-8 text-xs w-36"
                        required
                        minLength={8}
                      />
                      <Button type="submit" size="sm" disabled={loading} className="h-8 text-xs">Save</Button>
                      <Button type="button" size="sm" variant="outline" className="h-8 text-xs"
                        onClick={() => { setResetId(null); setNewPassword('') }}>Cancel</Button>
                    </form>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-xs"
                        onClick={() => { setResetId(u.id); setSuccess(null) }}>
                        Reset Password
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8 text-xs"
                        onClick={() => handleDelete(u.id, u.email)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-3">App Info</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">App Name</span>
            <span className="font-medium">Vania Hub</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database</span>
            <span className="font-medium text-emerald-600">Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}
