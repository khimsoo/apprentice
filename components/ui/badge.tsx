import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        {
          'text-gray-700 bg-gray-50 border-gray-200': variant === 'default',
          'text-green-700 bg-green-50 border-green-200': variant === 'success',
          'text-amber-700 bg-amber-50 border-amber-200': variant === 'warning',
          'text-red-700 bg-red-50 border-red-200': variant === 'danger',
          'text-blue-700 bg-blue-50 border-blue-200': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
