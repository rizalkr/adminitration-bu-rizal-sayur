'use client'

import { useState, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2 } from 'lucide-react'
import { formatRupiah, getTodayWIB } from '@/lib/utils'
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/types'
import type { ActionState, PaymentMethod, PaymentStatus, TransactionUnit } from '@/types'

interface Product {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

interface LineItem {
  id: string
  productId: string
  unit: TransactionUnit
  qty: number | string
  unitPrice: number
}

interface PurchaseFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  products: Product[]
  suppliers: Supplier[]
  defaultValues?: {
    supplierId?: string
    purchaseDate?: string
    paymentMethod?: PaymentMethod
    paymentStatus?: PaymentStatus
    items?: Array<{ productId: string; unit: TransactionUnit; qty: number | string; unitPrice: number }>
  }
  submitLabel?: string
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

export function PurchaseForm({
  action,
  products,
  suppliers,
  defaultValues,
  submitLabel = 'Simpan Pembelian',
}: PurchaseFormProps) {
  const [state, formAction, pending] = useActionState(action, {})
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    defaultValues?.paymentMethod ?? 'Cash',
  )
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    defaultValues?.paymentStatus ?? 'Lunas',
  )
  const [items, setItems] = useState<LineItem[]>(
    defaultValues?.items?.map((i) => ({
      ...i,
      id: generateId(),
      unit: i.unit ?? 'ekor',
    })) ?? [
      { id: generateId(), productId: '', unit: 'ekor', qty: 1, unitPrice: 0 },
    ],
  )

  function handlePaymentMethodChange(method: PaymentMethod) {
    setPaymentMethod(method)
    if (method === 'Hutang') setPaymentStatus('Belum Lunas')
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: generateId(), productId: '', unit: 'ekor', qty: 1, unitPrice: 0 },
    ])
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function updateItem(id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        if (field === 'unit' && value === 'ekor') {
          const currentQty = typeof i.qty === 'string' ? parseFloat(i.qty) || 1 : i.qty
          return { ...i, unit: 'ekor', qty: Math.max(1, Math.round(currentQty)) }
        }
        return { ...i, [field]: value }
      }),
    )
  }

  const totalAmount = items.reduce((sum, item) => {
    const q = typeof item.qty === 'string' ? parseFloat(item.qty) || 0 : item.qty
    return sum + q * item.unitPrice
  }, 0)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const hiddenItems = form.querySelector<HTMLInputElement>('input[name="items"]')
    if (hiddenItems) {
      hiddenItems.value = JSON.stringify(
        items.map(({ productId, unit, qty, unitPrice }) => ({
          productId,
          unit,
          qty: typeof qty === 'string' ? parseFloat(qty) || 0 : qty,
          unitPrice,
        })),
      )
    }
    const methodInput = form.querySelector<HTMLInputElement>('input[name="paymentMethod"]')
    if (methodInput) methodInput.value = paymentMethod
    const statusInput = form.querySelector<HTMLInputElement>('input[name="paymentStatus"]')
    if (statusInput) statusInput.value = paymentStatus
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <input type="hidden" name="items" defaultValue="[]" />
      <input type="hidden" name="paymentMethod" defaultValue={paymentMethod} />
      <input type="hidden" name="paymentStatus" defaultValue={paymentStatus} />

      {state.message && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{state.message}</p>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierId">Pemasok</Label>
              <select
                id="supplierId"
                name="supplierId"
                defaultValue={defaultValues?.supplierId ?? ''}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground"
                required
              >
                <option value="">Pilih Pemasok</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {suppliers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Belum ada pemasok aktif.
                </p>
              )}
              {state.errors?.supplierId && (
                <p className="text-sm text-destructive">{state.errors.supplierId[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Tanggal</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={defaultValues?.purchaseDate ?? getTodayWIB()}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Metode Pembayaran</Label>
              <Select value={paymentMethod} onValueChange={(v) => handlePaymentMethodChange(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status Pembayaran</Label>
              <Select
                value={paymentStatus}
                onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}
                disabled={paymentMethod === 'Hutang'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {paymentMethod === 'Hutang' && (
                <p className="text-xs text-muted-foreground">
                  Otomatis Belum Lunas untuk metode Hutang
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Item Produk</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Item
          </Button>
        </div>

        {state.errors?.items && (
          <p className="text-sm text-destructive mb-2">{state.errors.items[0]}</p>
        )}

        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-12 gap-2 items-end">
                  {/* Product select */}
                  <div className="col-span-12 sm:col-span-4 space-y-1">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Produk</Label>}
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&>option]:bg-background [&>option]:text-foreground"
                      required
                    >
                      <option value="">Pilih Produk</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Satuan / Unit */}
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Satuan</Label>}
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value as TransactionUnit)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&>option]:bg-background [&>option]:text-foreground"
                      required
                    >
                      <option value="ekor">Ekor</option>
                      <option value="kg">Kg</option>
                    </select>
                  </div>

                  {/* Qty */}
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    {index === 0 && (
                      <Label className="text-xs text-muted-foreground">
                        Jumlah ({item.unit})
                      </Label>
                    )}
                    <Input
                      type="number"
                      min={item.unit === 'ekor' ? '1' : '0.01'}
                      step={item.unit === 'ekor' ? '1' : '0.01'}
                      value={item.qty}
                      onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>

                  {/* Unit price */}
                  <div className="col-span-4 sm:col-span-3 space-y-1">
                    {index === 0 && (
                      <Label className="text-xs text-muted-foreground">
                        Harga / {item.unit}
                      </Label>
                    )}
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="text-right"
                      required
                    />
                  </div>

                  {/* Remove */}
                  <div className="col-span-12 sm:col-span-1 flex justify-end">
                    {index === 0 && <div className="hidden sm:block h-4 mb-1" />}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right text-sm text-muted-foreground mt-1">
                  Subtotal: <span className="font-medium text-foreground">{formatRupiah((typeof item.qty === 'string' ? parseFloat(item.qty) || 0 : item.qty) * item.unitPrice)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-4" />
        <div className="flex justify-end">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-xl font-bold">{formatRupiah(totalAmount)}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Menyimpan...' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Batal
        </Button>
      </div>
    </form>
  )
}
