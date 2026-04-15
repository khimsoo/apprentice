'use client'

import { Bell, Search } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Profile } from '@/types/database'

interface HeaderProps {
  title: string
  profile: Profile | null
  action?: React.ReactNode
}

export function Header({ title, profile, action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-8 py-4">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center gap-3">
          {action}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <Avatar name={profile?.full_name} src={profile?.avatar_url} size="sm" />
        </div>
      </div>
    </header>
  )
}
