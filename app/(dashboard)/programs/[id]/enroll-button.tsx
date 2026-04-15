'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { UserPlus, UserMinus } from 'lucide-react'

interface EnrollButtonProps {
  programId: string
  apprenticeId: string
  initialEnrollment: { id: string; status: string } | null
}

export function EnrollButton({ programId, apprenticeId, initialEnrollment }: EnrollButtonProps) {
  const [enrollment, setEnrollment] = useState(initialEnrollment)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleEnroll() {
    setLoading(true)
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ program_id: programId, apprentice_id: apprenticeId, status: 'active' })
      .select('id, status')
      .single()

    if (!error && data) {
      setEnrollment(data)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleUnenroll() {
    if (!enrollment) return
    setLoading(true)
    await supabase.from('enrollments').delete().eq('id', enrollment.id)
    setEnrollment(null)
    router.refresh()
    setLoading(false)
  }

  if (enrollment) {
    return (
      <Button variant="secondary" size="sm" loading={loading} onClick={handleUnenroll}>
        <UserMinus className="w-4 h-4" />
        Unenroll
      </Button>
    )
  }

  return (
    <Button size="sm" loading={loading} onClick={handleEnroll}>
      <UserPlus className="w-4 h-4" />
      Enroll
    </Button>
  )
}
