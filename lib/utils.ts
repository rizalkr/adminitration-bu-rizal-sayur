import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a numeric string or number as Indonesian Rupiah.
 * Drizzle returns numeric columns as strings from PostgreSQL.
 */
export function formatRupiah(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format a date string (YYYY-MM-DD) to Indonesian locale.
 * Uses a fixed timezone-safe approach to avoid off-by-one day issues.
 */
export function formatDate(dateStr: string): string {
  // Parse as local date to avoid UTC/WIB offset issues
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Get today's date in WIB (UTC+7) as a YYYY-MM-DD string.
 * Used for dashboard queries and default form values.
 */
export function getTodayWIB(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

/**
 * Calculate subtotal server-side.
 * qty is a number (integer for ekor, decimal for kg); unitPrice is a numeric number.
 */
export function calculateSubtotal(qty: number, unitPrice: number): number {
  return Math.round(qty * unitPrice * 100) / 100
}

/**
 * Format quantity display with its unit.
 * Ekor is formatted as an integer, kg displays decimal without trailing zeros.
 */
export function formatQty(qty: number | string, unit: string): string {
  const num = typeof qty === 'string' ? parseFloat(qty) : qty
  if (isNaN(num)) return `0 ${unit}`
  if (unit === 'ekor') {
    return `${Math.round(num)} ekor`
  }
  const str = Number.isInteger(num) ? num.toString() : parseFloat(num.toFixed(2)).toString()
  return `${str} kg`
}

/**
 * Format combined quantity display for summary lists (ekor and/or kg).
 * Example: "10 ekor", "25.5 kg", or "10 ekor, 25.5 kg". Never sums ekor + kg.
 */
export function formatTotalQty(qtyEkor: number | string, qtyKg: number | string): string {
  const ekor = typeof qtyEkor === 'string' ? parseFloat(qtyEkor) : qtyEkor
  const kg = typeof qtyKg === 'string' ? parseFloat(qtyKg) : qtyKg
  const parts: string[] = []
  if (ekor > 0) parts.push(formatQty(ekor, 'ekor'))
  if (kg > 0) parts.push(formatQty(kg, 'kg'))
  return parts.length > 0 ? parts.join(', ') : '0'
}

/**
 * Sanitize a string to prevent CSV / Formula injection (=, +, -, @, \t, \r)
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let str = String(value)
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@') || str.startsWith('\t') || str.startsWith('\r')) {
    str = `'${str}`
  }
  // Escape quotes for CSV
  str = str.replace(/"/g, '""')
  return `"${str}"`
}

/**
 * Format records array as CSV string (UTF-8 with BOM for Excel compatibility)
 */
export function generateCsvResponse(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]): Response {
  const headerLine = headers.map(sanitizeCsvCell).join(',')
  const rowLines = rows.map((row) => row.map(sanitizeCsvCell).join(','))
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n')

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
