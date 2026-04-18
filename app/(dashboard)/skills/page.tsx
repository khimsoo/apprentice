import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { skills } from '@/lib/skills-data'
import { Profile } from '@/types/database'
import Link from 'next/link'
import { Library, ArrowRight, Settings } from 'lucide-react'

export default async function SkillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const isMentor = profile?.role === 'mentor'

  return (
    <>
      <Header
        title="Skills Library"
        profile={profile as Profile}
        action={
          isMentor ? (
            <Link href="/skills/manage">
              <button className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-4 h-4" />
                Manage Links
              </button>
            </Link>
          ) : undefined
        }
      />
      <main className="flex-1 px-8 py-8">
        <div className="mb-8">
          <p className="text-gray-500 text-sm max-w-xl">
            Curated, high-quality resources organised by skill area and difficulty. Practical, interview-relevant content over generic intros.
          </p>
        </div>

        {skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <Library className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No skills yet</h3>
            <p className="text-gray-500 text-sm max-w-xs">Check back soon for curated learning resources.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {skills.map((skill) => {
              const totalResources = skill.categories.reduce((acc, cat) => acc + cat.resources.length, 0)
              return (
                <Link key={skill.slug} href={`/skills/${skill.slug}`}>
                  <Card hover className="h-full flex flex-col">
                    <CardContent className="flex-1 p-6">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                        <Library className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{skill.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-3 mb-4">{skill.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                        <span>{skill.categories.length} skill areas</span>
                        <span>{totalResources} resources</span>
                        <span className="flex items-center gap-1 text-indigo-500 font-medium">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
