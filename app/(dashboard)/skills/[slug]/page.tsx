import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { getSkillBySlug, Difficulty, ResourceType } from '@/lib/skills-data'
import { Profile } from '@/types/database'
import Link from 'next/link'
import { ExternalLink, AlertTriangle, ChevronLeft } from 'lucide-react'

const difficultyConfig: Record<Difficulty, { label: string; dot: string; badge: string }> = {
  beginner: { label: 'Beginner', dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-200' },
  intermediate: { label: 'Intermediate', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  advanced: { label: 'Advanced', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200' },
}

const typeLabel: Record<ResourceType, string> = {
  video: 'Video',
  course: 'Course',
  podcast: 'Podcast',
  practice: 'Practice',
  insight: 'Insight',
}

const typeColor: Record<ResourceType, string> = {
  video: 'bg-blue-50 text-blue-700',
  course: 'bg-purple-50 text-purple-700',
  podcast: 'bg-orange-50 text-orange-700',
  practice: 'bg-teal-50 text-teal-700',
  insight: 'bg-gray-100 text-gray-700',
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const skill = getSkillBySlug(slug)
  if (!skill) notFound()

  return (
    <>
      <Header title={skill.title} profile={profile as Profile} />
      <main className="flex-1 px-8 py-8 max-w-5xl">
        {/* Back link */}
        <Link
          href="/skills"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Skills Library
        </Link>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-10 max-w-2xl">{skill.description}</p>

        {/* Difficulty map */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {skill.difficultyMap.map(({ level, focus }) => {
            const key = level.toLowerCase() as Difficulty
            const cfg = difficultyConfig[key]
            return (
              <div key={level} className={`rounded-xl border px-4 py-3 ${cfg.badge}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-semibold">{level}</span>
                </div>
                <p className="text-xs opacity-80">{focus}</p>
              </div>
            )
          })}
        </div>

        {/* Skill categories */}
        <div className="space-y-10">
          {skill.categories.map((category) => {
            const byDifficulty: Record<Difficulty, typeof category.resources> = {
              beginner: [],
              intermediate: [],
              advanced: [],
            }
            for (const r of category.resources) {
              byDifficulty[r.difficulty].push(r)
            }

            return (
              <section key={category.id}>
                <h2 className="text-base font-semibold text-gray-900 mb-4">{category.title}</h2>
                <div className="space-y-6">
                  {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((level) => {
                    const resources = byDifficulty[level]
                    if (resources.length === 0) return null
                    const cfg = difficultyConfig[level]
                    return (
                      <div key={level}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {cfg.label}
                          </span>
                        </div>
                        <div className="space-y-3 pl-4">
                          {resources.map((resource, i) => (
                            <Card key={i}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[resource.type]}`}>
                                        {typeLabel[resource.type]}
                                      </span>
                                      {resource.note && (
                                        <span className="text-xs text-gray-400 italic">{resource.note}</span>
                                      )}
                                    </div>
                                    {resource.url ? (
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 mt-1"
                                      >
                                        {resource.title}
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                      </a>
                                    ) : (
                                      <p className="text-sm font-medium text-gray-900 mt-1">{resource.title}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{resource.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        {/* Practice routine */}
        <section className="mt-12">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{skill.practiceRoutine.title}</h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-50">
                {skill.practiceRoutine.schedule.map(({ label, focus }) => (
                  <li key={label} className="flex items-center gap-4 px-6 py-3.5">
                    <span className="text-xs font-semibold text-gray-400 w-20 flex-shrink-0">{label}</span>
                    <span className="text-sm text-gray-700">{focus}</span>
                  </li>
                ))}
              </ul>
              {skill.practiceRoutine.tip && (
                <div className="px-6 py-4 border-t border-gray-100 bg-indigo-50 rounded-b-xl">
                  <p className="text-xs text-indigo-700">{skill.practiceRoutine.tip}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Warnings */}
        <section className="mt-8 mb-12">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">What to Avoid</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-50">
                {skill.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-3 px-6 py-3.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  )
}
