/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, getStatusColor } from '@/lib/utils'
import Link from 'next/link'
import { BookOpen, Plus, Users, Calendar } from 'lucide-react'
import { Profile } from '@/types/database'

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const isMentor = profile?.role === 'mentor'

  type ProgramItem = {
    id: string
    title: string
    description: string | null
    status: string
    start_date: string | null
    end_date: string | null
    mentor?: { full_name: string | null; avatar_url: string | null }
    enrollmentCount: number
    taskCount: number
    isEnrolled?: boolean
  }

  let programs: ProgramItem[] = []

  if (isMentor) {
    const { data } = await supabase
      .from('programs')
      .select('id, title, description, status, start_date, end_date, enrollments(count), tasks(count)')
      .eq('mentor_id', user.id)
      .order('created_at', { ascending: false })

    programs = ((data || []) as any[]).map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      start_date: p.start_date,
      end_date: p.end_date,
      enrollmentCount: Array.isArray(p.enrollments) ? (p.enrollments[0]?.count ?? 0) : 0,
      taskCount: Array.isArray(p.tasks) ? (p.tasks[0]?.count ?? 0) : 0,
    }))
  } else {
    const { data } = await supabase
      .from('programs')
      .select('id, title, description, status, start_date, end_date, profiles!mentor_id(full_name, avatar_url), enrollments(count), tasks(count)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    const { data: myEnrollments } = await supabase
      .from('enrollments').select('program_id').eq('apprentice_id', user.id)

    const enrolledIds = new Set(((myEnrollments || []) as any[]).map((e) => e.program_id))

    programs = ((data || []) as any[]).map((p) => {
      const mentor = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        start_date: p.start_date,
        end_date: p.end_date,
        mentor: mentor ?? undefined,
        enrollmentCount: Array.isArray(p.enrollments) ? (p.enrollments[0]?.count ?? 0) : 0,
        taskCount: Array.isArray(p.tasks) ? (p.tasks[0]?.count ?? 0) : 0,
        isEnrolled: enrolledIds.has(p.id),
      }
    })
  }

  return (
    <>
      <Header
        title="Programs"
        profile={profile as Profile}
        action={
          isMentor ? (
            <Link href="/programs/new">
              <Button size="sm"><Plus className="w-4 h-4" />New Program</Button>
            </Link>
          ) : undefined
        }
      />
      <main className="flex-1 px-8 py-8">
        {programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isMentor ? 'No programs yet' : 'No programs available'}
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              {isMentor
                ? 'Create your first apprenticeship program to get started.'
                : 'Check back later for available programs to enroll in.'}
            </p>
            {isMentor && (
              <Link href="/programs/new">
                <Button><Plus className="w-4 h-4" />Create program</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Link key={program.id} href={`/programs/${program.id}`}>
                <Card hover className="h-full flex flex-col">
                  <CardContent className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize border ${getStatusColor(program.status)}`}>
                        {program.status}
                      </span>
                      {program.isEnrolled !== undefined && (
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${program.isEnrolled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                          {program.isEnrolled ? 'Enrolled' : 'Not enrolled'}
                        </span>
                      )}
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{program.title}</h3>
                    {program.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{program.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {program.enrollmentCount} apprentice{program.enrollmentCount !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {program.taskCount} task{program.taskCount !== 1 ? 's' : ''}
                      </span>
                      {program.end_date && (
                        <span className="flex items-center gap-1 ml-auto">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(program.end_date)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
