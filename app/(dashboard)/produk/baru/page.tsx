import { createProduct } from '@/lib/actions/products'
import { ProductForm } from '@/components/master-data/product-form'
import { PageHeader } from '@/components/layout/page-header'

export default function ProdukBaruPage() {
  return (
    <div>
      <PageHeader
        title="Produk Baru"
        breadcrumbs={[
          { label: 'Produk', href: '/produk' },
          { label: 'Baru' },
        ]}
      />
      <ProductForm action={createProduct} submitLabel="Simpan Produk" />
    </div>
  )
}
