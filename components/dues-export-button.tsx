'use client'

import { Button } from '@/components/ui/button'
import { exportDues } from '@/lib/utils/excel-export'
import { Download } from 'lucide-react'

export function DuesExportButton({ dues }: { dues: any[] }) {
  const handleExport = () => {
    if (dues.length === 0) {
      alert('No dues to export')
      return
    }
    exportDues(dues)
  }

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      Export to Excel
    </Button>
  )
}
