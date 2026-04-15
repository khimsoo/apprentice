/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, getPriorityColor, getStatusColor, daysUntil } from '@/lib/utils'
import Link from 'next/link'
import { CheckSquare, Clock, AlertCircle, BookOpen } from 'lucide-react'
import { Profile } from '@/types/database'
import { SubmitTaskButton } from './submit-task-button'

type TaskItem = {
  id: string
  title: string
  description: string | null
  due_date: string | null
  priority: string
  programs: { id: string; title: string } | null
  milestones: { title: string } | null
  mySubmission: { id: string; status: string; content: string | null; feedback: string | null } | null
  allSubmissions?: { id: string; status: string }[]
}

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const isMentor = profile?.role === 'mentor'
  let tasks: TaskItem[] = []

  if (isMentor) {
    const { data } = await supabase
      .from('tasks')
      .select('id, title, description, due_date, priority, programs(id, title), milestones(title), task_submissions(id, status)')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    tasks = ((data || []) as any[]).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      due_date: t.due_date,
      priority: t.priority,
      programs: Array.isArray(t.programs) ? t.programs[0] ?? null : t.programs,
      milestones: Array.isArray(t.milestones) ? t.milestones[0] ?? null : t.milestones,
      mySubmission: null,
      allSubmissions: t.task_submissions ?? [],
    }))
  } else {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('program_id')
      .eq('apprentice_id', user.id)
      .eq('status', 'active')

    const programIds = ((enrollments || []) as any[]).map((e) => e.program_id)

    if (programIds.length > 0) {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, description, due_date, priority, programs(id, title), milestones(title), task_submissions(id, status, content, feedback, apprentice_id)')
        .in('program_id', programIds)
        .order('due_date', { ascending: true, nullsFirst: false })

      tasks = ((data || []) as any[]).map((t) => {
        const subs: any[] = Array.isArray(t.task_submissions) ? t.task_submissions : []
        const mine = subs.find((s) => s.apprentice_id === user.id)
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          due_date: t.due_date,
          priority: t.priority,
          programs: Array.isArray(t.programs) ? t.programs[0] ?? null : t.programs,
          milestones: Array.isArray(t.milestones) ? t.milestones[0] ?? null : t.milestones,
          mySubmission: mine ? { id: mine.id, status: mine.status, content: mine.content, feedback: mine.feedback } : null,
        }
      })
    }
  }

  const byProgram = tasks.reduce<Record<string, { title: string; tasks: TaskItem[] }>>((acc, task) => {
    const pid = task.programs?.id ?? 'unknown'
    const ptitle = task.programs?.title ?? 'Unknown Program'
    if (!acc[pid]) acc[pid] = { title: ptitle, tasks: [] }
    acc[pid].tasks.push(task)
    return acc
  }, {})

  return (
    <>
      <Header title="Tasks" profile={profile as Profile} />
      <main className="flex-1 px-8 py-8">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <CheckSquare className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              {isMentor
                ? 'Create tasks in your programs to assign work to apprentices.'
                : 'Enroll in a program to see and complete tasks.'}
            </p>
            <Link href="/programs" className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Go to Programs →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {!isMentor && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Tasks', value: tasks.length },
                  { label: 'Submitted', value: tasks.filter((t) => t.mySubmission && t.mySubmission.status !== 'pending').length },
                  { label: 'Approved', value: tasks.filter((t) => t.mySubmission?.status === 'approved').length },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="py-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {Object.entries(byProgram).map(([pid, group]) => (
              <div key={pid}>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <Link href={`/programs/${pid}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                    {group.title}
                  </Link>
                  <span className="text-xs text-gray-400">({group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''})</span>
                </div>
                <div className="space-y-3">
                  {group.tasks.map((task) => {
                    const days = daysUntil(task.due_date)
                    const isOverdue = days !== null && days < 0
                    return (
                      <Card key={task.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                                {task.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded border capitalize ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  {task.milestones && (
                                    <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                      {task.milestones.title}
                                    </span>
                                  )}
                                </div>
                                {isMentor && task.allSubmissions && (
                                  <p className="text-xs text-gray-400 mt-2">
                                    {task.allSubmissions.length} submission{task.allSubmissions.length !== 1 ? 's' : ''}
                                  </p>
                                )}
                                {!isMentor && task.mySubmission?.feedback && (
                                  <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                                    <span className="font-medium">Feedback: </span>
                                    {task.mySubmission.feedback}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              {task.due_date && (
                                <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600' : days !== null && days <= 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                                  {isOverdue && <AlertCircle className="w-3 h-3" />}
                                  <Clock className="w-3 h-3" />
                                  {isOverdue ? `${Math.abs(days!)}d overdue` : formatDate(task.due_date)}
                                </span>
                              )}
                              {!isMentor && (
                                <div className="flex items-center gap-2">
                                  {task.mySubmission && (
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${getStatusColor(task.mySubmission.status)}`}>
                                      {task.mySubmission.status.replace('_', ' ')}
                                    </span>
                                  )}
                                  <SubmitTaskButton taskId={task.id} apprenticeId={user.id} submission={task.mySubmission} />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
