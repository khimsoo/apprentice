/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { formatDate, getStatusColor, getPriorityColor, daysUntil } from '@/lib/utils'
import Link from 'next/link'
import {
  BookOpen, Users, Calendar, CheckSquare, Clock,
  ArrowLeft, Target, AlertCircle
} from 'lucide-react'
import { Profile } from '@/types/database'
import { EnrollButton } from './enroll-button'
import { NewTaskModal } from './new-task-modal'
import { NewMilestoneModal } from './new-milestone-modal'
import { Button } from '@/components/ui/button'

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: program } = await supabase
    .from('programs')
    .select('*, profiles!mentor_id(id, full_name, avatar_url, email)')
    .eq('id', id)
    .single()

  if (!program) notFound()

  const mentor = Array.isArray(program.profiles) ? program.profiles[0] : program.profiles

  const isMentor = profile?.role === 'mentor'
  const isOwner = program.mentor_id === user.id

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, status')
    .eq('program_id', id)
    .eq('apprentice_id', user.id)
    .maybeSingle()

  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('program_id', id)
    .order('order_index', { ascending: true })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, milestones(title), task_submissions(id, status, apprentice_id)')
    .eq('program_id', id)
    .order('created_at', { ascending: false })

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, status, enrolled_at, profiles!apprentice_id(id, full_name, avatar_url, email)')
    .eq('program_id', id)
    .order('enrolled_at', { ascending: false })

  const myTasks = ((tasks || []) as any[]).map((t) => {
    const mySubmission = t.task_submissions?.find((s: any) => s.apprentice_id === user.id)
    return { ...t, mySubmission }
  })

  return (
    <>
      <Header title={program.title} profile={profile as Profile} />
      <main className="flex-1 px-8 py-8 space-y-6">
        <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          All Programs
        </Link>

        {/* Program header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{program.title}</h1>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize border ${getStatusColor(program.status)}`}>
                    {program.status}
                  </span>
                </div>
                {program.description && (
                  <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{program.description}</p>
                )}
                <div className="flex items-center gap-6 mt-3 text-sm text-gray-400">
                  {mentor && (
                    <span className="flex items-center gap-1.5">
                      <Avatar name={mentor.full_name} src={mentor.avatar_url} size="sm" />
                      {mentor.full_name || 'Mentor'}
                    </span>
                  )}
                  {program.start_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(program.start_date)}
                      {program.end_date && ` → ${formatDate(program.end_date)}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {enrollments?.length ?? 0} apprentice{(enrollments?.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              {!isMentor && !isOwner && (
                <EnrollButton
                  programId={id}
                  apprenticeId={user.id}
                  initialEnrollment={enrollment as { id: string; status: string } | null}
                />
              )}
              {isOwner && (
                <Link href={`/programs/${id}/edit`}>
                  <Button variant="secondary" size="sm">Edit Program</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Milestones + Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Milestones */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-semibold text-gray-900">Milestones</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {milestones?.length ?? 0}
                  </span>
                </div>
                {isOwner && <NewMilestoneModal programId={id} />}
              </CardHeader>
              <CardContent className="p-0">
                {!milestones || milestones.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-gray-400">
                    {isOwner ? 'Add milestones to structure the program.' : 'No milestones defined yet.'}
                  </div>
                ) : (
                  <ol className="divide-y divide-gray-50">
                    {milestones.map((m: any, idx: number) => (
                      <li key={m.id} className="flex items-start gap-4 px-6 py-4">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{m.title}</p>
                          {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                        </div>
                        {m.due_date && (
                          <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {formatDate(m.due_date)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-semibold text-gray-900">Tasks</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {tasks?.length ?? 0}
                  </span>
                </div>
                {isOwner && <NewTaskModal programId={id} milestones={(milestones ?? []) as { id: string; title: string }[]} />}
              </CardHeader>
              <CardContent className="p-0">
                {myTasks.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-gray-400">
                    {isOwner ? 'Add tasks for your apprentices.' : 'No tasks assigned yet.'}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {myTasks.map((task: any) => {
                      const days = daysUntil(task.due_date)
                      const isOverdue = days !== null && days < 0
                      const milestone = Array.isArray(task.milestones) ? task.milestones[0] : task.milestones
                      return (
                        <li key={task.id} className="flex items-start gap-4 px-6 py-4">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                            {task.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded border capitalize ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              {milestone && <span className="text-xs text-gray-400">{milestone.title}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {task.due_date && (
                              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-400'}`}>
                                {isOverdue && <AlertCircle className="w-3 h-3" />}
                                <Clock className="w-3 h-3" />
                                {formatDate(task.due_date)}
                              </span>
                            )}
                            {!isMentor && task.mySubmission && (
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border capitalize ${getStatusColor(task.mySubmission.status)}`}>
                                {task.mySubmission.status}
                              </span>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Apprentices */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-semibold text-gray-900">Apprentices</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {enrollments?.length ?? 0}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!enrollments || enrollments.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-gray-400">
                    No apprentices enrolled yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {((enrollments || []) as any[]).map((e) => {
                      const ap = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles
                      return (
                        <li key={e.id} className="flex items-center gap-3 px-6 py-3.5">
                          <Avatar name={ap?.full_name} src={ap?.avatar_url} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{ap?.full_name ?? 'Apprentice'}</p>
                            <p className="text-xs text-gray-400">Enrolled {formatDate(e.enrolled_at)}</p>
                          </div>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border capitalize ${getStatusColor(e.status)}`}>
                            {e.status}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
