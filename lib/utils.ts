import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'medium':
      return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-700 bg-green-50 border-green-200'
    case 'completed':
      return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'draft':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'archived':
      return 'text-gray-500 bg-gray-50 border-gray-200'
    case 'pending':
      return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'approved':
      return 'text-green-700 bg-green-50 border-green-200'
    case 'needs_revision':
      return 'text-red-700 bg-red-50 border-red-200'
    case 'submitted':
      return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'withdrawn':
      return 'text-gray-500 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
