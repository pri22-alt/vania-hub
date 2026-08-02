'use client'

import { Button } from '@/components/ui/button'
import { exportSales } from '@/lib/utils/excel-export'
import { Download } from 'lucide-react'

export function SalesExportButton({ sales }: { sales: any[] }) {
  const handleExport = () => {
    if (sales.length === 0) {
      alert('No sales to export')
      return
    }
    exportSales(sales)
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
