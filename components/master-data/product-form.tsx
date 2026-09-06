'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ActionState, Product } from '@/types'

interface ProductFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  defaultValues?: Partial<Product>
  submitLabel?: string
}

export function ProductForm({ action, defaultValues, submitLabel = 'Simpan' }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state.message && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{state.message}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nama Produk</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name ?? ''}
          placeholder="Contoh: Ayam Kampung"
          required
          aria-describedby={state.errors?.name ? 'name-error' : undefined}
        />
        {state.errors?.name && (
          <p id="name-error" className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
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
