'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  PackageOpen,
  Package,
  Users,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/penjualan', label: 'Jual', icon: ShoppingCart },
  { href: '/pembelian', label: 'Beli', icon: PackageOpen },
  { href: '/produk', label: 'Produk', icon: Package },
  { href: '/pelanggan', label: 'Pelanggan', icon: Users },
  { href: '/pemasok', label: 'Pemasok', icon: Truck },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
      <div className="flex items-center justify-around py-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-2 text-xs font-medium transition-colors min-w-0',
              isActive(href)
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
