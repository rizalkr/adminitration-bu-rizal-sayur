import { notFound } from 'next/navigation'
import { getSupplierById } from '@/lib/queries/suppliers'
import { updateSupplier } from '@/lib/actions/suppliers'
import { SupplierForm } from '@/components/master-data/supplier-form'
import { PageHeader } from '@/components/layout/page-header'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPemasokPage({ params }: Props) {
  const { id } = await params
  const supplier = await getSupplierById(id)
  if (!supplier) notFound()

  const action = updateSupplier.bind(null, id)

  return (
    <div>
      <PageHeader
        title="Edit Pemasok"
        breadcrumbs={[
          { label: 'Pemasok', href: '/pemasok' },
          { label: supplier.name },
        ]}
      />
      <SupplierForm action={action} defaultValues={supplier} submitLabel="Simpan Perubahan" />
    </div>
  )
}
