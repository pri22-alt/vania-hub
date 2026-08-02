'use client'

import { Button } from '@/components/ui/button'
import { exportExpenses } from '@/lib/utils/excel-export'
import { Download } from 'lucide-react'

export function ExpenseExportButton({ expenses }: { expenses: any[] }) {
  const handleExport = () => {
    if (expenses.length === 0) {
      alert('No expenses to export')
      return
    }
    exportExpenses(expenses)
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
