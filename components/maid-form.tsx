'use client'

import { useState } from 'react'
import { manualCheckIn, generateMaidQRLink, clockInMaid, clockOutMaid } from '@/app/actions/maid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export function MaidForm({ recentAttendance }: { recentAttendance?: any }) {
  const [mode, setMode] = useState<'manual' | 'qr'>('manual')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clockInTime: new Date().toISOString().slice(0, 16),
    clockOutTime: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [qrLink, setQrLink] = useState<string | null>(null)

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      await manualCheckIn(
        formData.date,
        formData.clockInTime,
        formData.clockOutTime || undefined,
        formData.notes || undefined
      )
      setSuccess(true)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        clockInTime: new Date().toISOString().slice(0, 16),
        clockOutTime: '',
        notes: '',
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQR = async () => {
    setLoading(true)
    try {
      const link = await generateMaidQRLink()
      setQrLink(link)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode Selector */}
      <Card className="p-4">
        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => setMode('manual')}
            size="sm"
          >
            Manual Check-In
          </Button>
          <Button
            variant={mode === 'qr' ? 'default' : 'outline'}
            onClick={() => setMode('qr')}
            size="sm"
          >
            QR Code Link
          </Button>
        </div>
      </Card>

      {/* Manual Check-In Form */}
      {mode === 'manual' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Manual Check-In</h2>
          
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
            {/* Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            {/* Clock In Time */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="clockInTime">Clock In Time</Label>
              <Input
                id="clockInTime"
                type="datetime-local"
                value={formData.clockInTime}
                onChange={(e) => setFormData({ ...formData, clockInTime: e.target.value })}
                required
              />
            </div>

            {/* Clock Out Time (Optional) */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="clockOutTime">Clock Out Time (Optional)</Label>
              <Input
                id="clockOutTime"
                type="datetime-local"
                value={formData.clockOutTime}
                onChange={(e) => setFormData({ ...formData, clockOutTime: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                placeholder="Additional details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border border-input rounded-md px-3 py-2 text-sm resize-none"
                rows={3}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-600" role="status">
                Attendance recorded successfully!
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Recording...' : 'Record Attendance'}
            </Button>
          </form>
        </Card>
      )}

      {/* QR Code Mode */}
      {mode === 'qr' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Generate QR Code Link</h2>
          
          <p className="text-sm text-muted-foreground mb-4">
            Generate a unique link for the maid to clock in and out from their phone.
          </p>

          {qrLink ? (
            <div className="flex flex-col gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Link:</p>
                <p className="text-xs break-all font-mono bg-white p-2 rounded border border-input">
                  {window.location.origin}{qrLink}
                </p>
              </div>
              
              <Button
                onClick={() => {
                  const url = `${window.location.origin}${qrLink}`
                  navigator.clipboard.writeText(url)
                  alert('Link copied to clipboard!')
                }}
                variant="outline"
              >
                Copy Link
              </Button>

              <Button
                onClick={() => setQrLink(null)}
                variant="outline"
              >
                Generate New Link
              </Button>
            </div>
          ) : (
            <Button onClick={handleGenerateQR} disabled={loading} className="w-full">
              {loading ? 'Generating...' : 'Generate QR Link'}
            </Button>
          )}

          {error && (
            <p className="text-sm text-destructive mt-4" role="alert">
              {error}
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
