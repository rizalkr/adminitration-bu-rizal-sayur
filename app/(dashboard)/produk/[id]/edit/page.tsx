import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/queries/products'
import { updateProduct } from '@/lib/actions/products'
import { ProductForm } from '@/components/master-data/product-form'
import { PageHeader } from '@/components/layout/page-header'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProdukPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const action = updateProduct.bind(null, id)

  return (
    <div>
      <PageHeader
        title="Edit Produk"
        breadcrumbs={[
          { label: 'Produk', href: '/produk' },
          { label: 'Edit' },
        ]}
      />
      <ProductForm action={action} defaultValues={product} submitLabel="Simpan Perubahan" />
    </div>
  )
}
