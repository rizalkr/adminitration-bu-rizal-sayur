'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, RotateCcw } from 'lucide-react'
import type { DatePreset } from '@/types'

interface TransactionDateFilterProps {
  currentPeriod?: DatePreset
  currentStartDate?: string
  currentEndDate?: string
  displayLabel?: string
}

export function TransactionDateFilter({
  currentPeriod = 'this-month',
  currentStartDate = '',
  currentEndDate = '',
  displayLabel,
}: TransactionDateFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [dari, setDari] = useState(currentStartDate)
  const [sampai, setSampai] = useState(currentEndDate)
  const [showCustom, setShowCustom] = useState(currentPeriod === 'custom')

  function handlePreset(preset: DatePreset) {
    startTransition(() => {
      const params = new URLSearchParams()
      if (preset !== 'this-month') {
        params.set('period', preset)
      }
      setShowCustom(false)
      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => {
      const params = new URLSearchParams()
      params.set('period', 'custom')
      if (dari) params.set('dari', dari)
      if (sampai) params.set('sampai', sampai)
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function handleReset() {
    setDari('')
    setSampai('')
    setShowCustom(false)
    startTransition(() => {
      router.push(pathname)
    })
  }

  return (
    <div className="bg-card border rounded-lg p-3 sm:p-4 mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Filter Periode:</span>
          {displayLabel && (
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-normal">
              {displayLabel}
            </span>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant={currentPeriod === 'this-month' && !showCustom ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => handlePreset('this-month')}
            disabled={isPending}
          >
            Bulan Ini
          </Button>
          <Button
            type="button"
            variant={currentPeriod === 'today' && !showCustom ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => handlePreset('today')}
            disabled={isPending}
          >
            Hari Ini
          </Button>
          <Button
            type="button"
            variant={currentPeriod === 'last-month' && !showCustom ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => handlePreset('last-month')}
            disabled={isPending}
          >
            Bulan Lalu
          </Button>
          <Button
            type="button"
            variant={currentPeriod === 'all' && !showCustom ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => handlePreset('all')}
            disabled={isPending}
          >
            Semua
          </Button>
          <Button
            type="button"
            variant={showCustom || currentPeriod === 'custom' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setShowCustom((prev) => !prev)}
            disabled={isPending}
          >
            Kustom Tanggal
          </Button>
        </div>
      </div>

      {/* Custom Date Range Panel */}
      {(showCustom || currentPeriod === 'custom') && (
        <form
          onSubmit={handleCustomSubmit}
          className="pt-2 border-t flex flex-col sm:flex-row sm:items-end gap-3"
        >
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Dari Tanggal</label>
              <Input
                type="date"
                value={dari}
                onChange={(e) => setDari(e.target.value)}
                className="h-8 text-xs w-full sm:w-36"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Sampai Tanggal</label>
              <Input
                type="date"
                value={sampai}
                onChange={(e) => setSampai(e.target.value)}
                className="h-8 text-xs w-full sm:w-36"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" className="h-8 text-xs" disabled={isPending || (!dari && !sampai)}>
              {isPending ? 'Memuat...' : 'Terapkan'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={handleReset}
              disabled={isPending}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

