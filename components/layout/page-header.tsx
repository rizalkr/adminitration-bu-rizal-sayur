import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  breadcrumbs?: Array<{ label: string; href?: string }>
  className?: string
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          )}
        </div>
        {action && (
          <Link href={action.href} className={cn(buttonVariants({ size: 'sm' }))}>
            {action.label}
          </Link>
        )}
      </div>
    </div>
  )
}


