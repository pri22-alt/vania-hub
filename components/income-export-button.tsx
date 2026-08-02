'use client'

import { Button } from '@/components/ui/button'
import { exportIncome } from '@/lib/utils/excel-export'
import { Download } from 'lucide-react'

export function IncomeExportButton({ income }: { income: any[] }) {
  const handleExport = () => {
    if (income.length === 0) {
      alert('No income records to export')
      return
    }
    exportIncome(income)
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
