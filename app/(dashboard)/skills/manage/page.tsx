import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { getAllLinkedResources } from '@/lib/skills-data'
import { getRemovedLinks } from '@/app/actions/skills'
import { Profile } from '@/types/database'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { LinkManager } from './link-manager'

export default async function ManageLinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'mentor') redirect('/skills')

  const [linkedResources, removedUrls] = await Promise.all([
    Promise.resolve(getAllLinkedResources()),
    getRemovedLinks(),
  ])

  return (
    <>
      <Header title="Manage Skill Links" profile={profile as Profile} />
      <main className="flex-1 px-8 py-8 max-w-4xl">
        <Link
          href="/skills"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Skills Library
        </Link>
        <p className="text-sm text-gray-500 mb-8 max-w-xl">
          Check all resource links for availability, select broken ones, and remove them. Removed links are hidden from learners but can be restored at any time.
        </p>
        <LinkManager linkedResources={linkedResources} initialRemovedUrls={removedUrls} />
      </main>
    </>
  )
}
