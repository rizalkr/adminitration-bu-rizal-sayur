import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/queries/products'
import { toggleProductActive, deleteProduct } from '@/lib/actions/products'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'

export default async function ProdukPage() {
  const products = await getProducts(true) // include inactive

  return (
    <div>
      <PageHeader
        title="Produk"
        description="Kelola daftar produk unggas"
        action={{ label: '+ Produk Baru', href: '/produk/baru' }}
      />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Belum ada produk. Tambahkan produk baru.
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>
                    {product.isActive ? 'Aktif' : 'Non-aktif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(product.createdAt.toISOString().split('T')[0])}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/produk/${product.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        'use server'
                        await toggleProductActive(product.id, !product.isActive)
                      }}
                    >
                      <Button variant="outline" size="sm" type="submit">
                        {product.isActive ? 'Non-aktifkan' : 'Aktifkan'}
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        'use server'
                        await deleteProduct(product.id)
                      }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        type="submit"
                        className="text-destructive hover:text-destructive"
                      >
                        Hapus
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
