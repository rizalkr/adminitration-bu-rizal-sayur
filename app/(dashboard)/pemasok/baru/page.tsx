import { createSupplier } from '@/lib/actions/suppliers'
import { SupplierForm } from '@/components/master-data/supplier-form'
import { PageHeader } from '@/components/layout/page-header'

export default function PemasokBaruPage() {
  return (
    <div>
      <PageHeader
        title="Pemasok Baru"
        breadcrumbs={[
          { label: 'Pemasok', href: '/pemasok' },
          { label: 'Baru' },
        ]}
      />
      <SupplierForm action={createSupplier} submitLabel="Simpan Pemasok" />
    </div>
  )
}
