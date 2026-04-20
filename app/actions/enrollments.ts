'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function assertProgramOwner(programId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase: null, error: 'Unauthenticated' }

  const { data: program } = await supabase
    .from('programs').select('mentor_id').eq('id', programId).single()
  if (program?.mentor_id !== user.id) return { supabase: null, error: 'Unauthorized' }

  return { supabase, error: null }
}

export async function approveApplication(enrollmentId: string, programId: string) {
  const { supabase, error } = await assertProgramOwner(programId)
  if (error || !supabase) return { error }

  const { error: dbError } = await supabase
    .from('enrollments')
    .update({ status: 'active' })
    .eq('id', enrollmentId)

  if (dbError) return { error: dbError.message }
  revalidatePath(`/programs/${programId}`)
  return {}
}

export async function rejectApplication(enrollmentId: string, programId: string) {
  const { supabase, error } = await assertProgramOwner(programId)
  if (error || !supabase) return { error }

  const { error: dbError } = await supabase
    .from('enrollments')
    .update({ status: 'withdrawn' })
    .eq('id', enrollmentId)

  if (dbError) return { error: dbError.message }
  revalidatePath(`/programs/${programId}`)
  return {}
}
