'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ActionState, Customer } from '@/types'

interface CustomerFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  defaultValues?: Partial<Customer>
  submitLabel?: string
}

export function CustomerForm({ action, defaultValues, submitLabel = 'Simpan' }: CustomerFormProps) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state.message && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{state.message}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nama Pelanggan</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name ?? ''}
          placeholder="Contoh: Bu Siti"
          required
          aria-describedby={state.errors?.name ? 'name-error' : undefined}
        />
        {state.errors?.name && (
          <p id="name-error" className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="desa">Desa</Label>
        <Input
          id="desa"
          name="desa"
          defaultValue={defaultValues?.desa ?? ''}
          placeholder="Nama desa"
          required
          aria-describedby={state.errors?.desa ? 'desa-error' : undefined}
        />
        {state.errors?.desa && (
          <p id="desa-error" className="text-sm text-destructive">{state.errors.desa[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dukuh">Dukuh</Label>
        <Input
          id="dukuh"
          name="dukuh"
          defaultValue={defaultValues?.dukuh ?? ''}
          placeholder="Nama dukuh / lingkungan"
          required
          aria-describedby={state.errors?.dukuh ? 'dukuh-error' : undefined}
        />
        {state.errors?.dukuh && (
          <p id="dukuh-error" className="text-sm text-destructive">{state.errors.dukuh[0]}</p>
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
