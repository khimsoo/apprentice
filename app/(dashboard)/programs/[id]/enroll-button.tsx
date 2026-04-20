'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { UserPlus, UserMinus, Clock } from 'lucide-react'

interface EnrollButtonProps {
  programId: string
  apprenticeId: string
  initialEnrollment: { id: string; status: string } | null
}

export function EnrollButton({ programId, apprenticeId, initialEnrollment }: EnrollButtonProps) {
  const [enrollment, setEnrollment] = useState(
    initialEnrollment?.status === 'withdrawn' ? null : initialEnrollment
  )
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleApply() {
    setLoading(true)
    const { data, error } = await supabase
      .from('enrollments')
      .upsert(
        { program_id: programId, apprentice_id: apprenticeId, status: 'pending' },
        { onConflict: 'program_id,apprentice_id' }
      )
      .select('id, status')
      .single()

    if (!error && data) {
      setEnrollment(data)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleWithdraw() {
    if (!enrollment) return
    setLoading(true)
    await supabase.from('enrollments').delete().eq('id', enrollment.id)
    setEnrollment(null)
    router.refresh()
    setLoading(false)
  }

  if (enrollment?.status === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
          <Clock className="w-4 h-4" />
          Application pending
        </span>
        <Button variant="secondary" size="sm" loading={loading} onClick={handleWithdraw}>
          <UserMinus className="w-4 h-4" />
          Withdraw
        </Button>
      </div>
    )
  }

  if (enrollment?.status === 'active') {
    return (
      <Button variant="secondary" size="sm" loading={loading} onClick={handleWithdraw}>
        <UserMinus className="w-4 h-4" />
        Unenroll
      </Button>
    )
  }

  return (
    <Button size="sm" loading={loading} onClick={handleApply}>
      <UserPlus className="w-4 h-4" />
      Apply
    </Button>
  )
}
