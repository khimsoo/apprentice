'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getRemovedLinks(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('removed_skill_links').select('url')
  return (data ?? []).map((row) => row.url)
}

export async function removeLinks(urls: string[]): Promise<{ error?: string }> {
  if (urls.length === 0) return {}

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'mentor') return { error: 'Unauthorized' }

  const rows = urls.map((url) => ({ url, removed_by: user.id }))
  const { error } = await supabase
    .from('removed_skill_links')
    .upsert(rows, { onConflict: 'url' })

  if (error) {
    console.error('removeLinks error:', error.code)
    return { error: 'Failed to remove links. Please try again.' }
  }

  revalidatePath('/skills', 'layout')
  return {}
}

export async function restoreLink(url: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'mentor') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('removed_skill_links')
    .delete()
    .eq('url', url)

  if (error) {
    console.error('restoreLink error:', error.code)
    return { error: 'Failed to restore link. Please try again.' }
  }

  revalidatePath('/skills', 'layout')
  return {}
}
