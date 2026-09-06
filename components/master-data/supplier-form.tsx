'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ActionState, Supplier } from '@/types'

interface SupplierFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  defaultValues?: Partial<Supplier>
  submitLabel?: string
}

export function SupplierForm({ action, defaultValues, submitLabel = 'Simpan' }: SupplierFormProps) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state.message && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{state.message}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nama Pemasok</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name ?? ''}
          placeholder="Nama pemasok"
          required
          aria-describedby={state.errors?.name ? 'name-error' : undefined}
        />
        {state.errors?.name && (
          <p id="name-error" className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          Alamat <span className="text-muted-foreground text-xs">(opsional)</span>
        </Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={defaultValues?.address ?? ''}
          placeholder="Alamat lengkap pemasok"
          rows={3}
          aria-describedby={state.errors?.address ? 'address-error' : undefined}
        />
        {state.errors?.address && (
          <p id="address-error" className="text-sm text-destructive">{state.errors.address[0]}</p>
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
