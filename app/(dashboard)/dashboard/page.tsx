/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDate, daysUntil, getStatusColor } from '@/lib/utils'
import Link from 'next/link'
import {
  BookOpen, CheckSquare, TrendingUp, Clock, Plus, ArrowRight, AlertCircle,
} from 'lucide-react'
import { Profile } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const isMentor = profile?.role === 'mentor'

  let programs: { id: string; title: string; status: string; _count: { enrollments: number } }[] = []
  let tasksDue: { id: string; title: string; due_date: string | null; priority: string; program: { title: string } | null }[] = []
  let recentActivity: { id: string; full_name: string | null; avatar_url: string | null; action: string; time: string }[] = []
  let stats = { programs: 0, tasks: 0, completed: 0, apprentices: 0 }

  if (isMentor) {
    const { data: programsData } = await supabase
      .from('programs')
      .select('id, title, status, enrollments(count)')
      .eq('mentor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    programs = ((programsData || []) as any[]).map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      _count: { enrollments: Array.isArray(p.enrollments) ? (p.enrollments[0]?.count ?? 0) : 0 },
    }))

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('id, title, due_date, priority, programs(title)')
      .eq('created_by', user.id)
      .order('due_date', { ascending: true })
      .limit(5)

    tasksDue = ((tasksData || []) as any[]).map((t) => ({
      id: t.id,
      title: t.title,
      due_date: t.due_date,
      priority: t.priority,
      program: Array.isArray(t.programs) ? t.programs[0] ?? null : t.programs,
    }))

    const { data: enrollData } = await supabase
      .from('enrollments')
      .select('apprentice_id, profiles(id, full_name, avatar_url), created_at')
      .in('program_id', programs.map((p) => p.id))
      .order('enrolled_at', { ascending: false })
      .limit(5)

    recentActivity = ((enrollData || []) as any[]).map((e) => {
      const p = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles
      return {
        id: e.apprentice_id,
        full_name: p?.full_name ?? null,
        avatar_url: p?.avatar_url ?? null,
        action: 'enrolled in a program',
        time: e.created_at,
      }
    })

    const { count: taskCount } = await supabase
      .from('tasks').select('*', { count: 'exact', head: true }).eq('created_by', user.id)

    const { count: apprenticeCount } = await supabase
      .from('enrollments').select('*', { count: 'exact', head: true })
      .in('program_id', programs.map((p) => p.id))

    stats = { programs: programs.length, tasks: taskCount ?? 0, completed: 0, apprentices: apprenticeCount ?? 0 }

  } else {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('id, status, programs(id, title, status)')
      .eq('apprentice_id', user.id)
      .order('enrolled_at', { ascending: false })
      .limit(5)

    programs = ((enrollments || []) as any[]).map((e) => {
      const prog = Array.isArray(e.programs) ? e.programs[0] : e.programs
      return { id: prog?.id ?? '', title: prog?.title ?? '', status: prog?.status ?? '', _count: { enrollments: 0 } }
    }).filter((p) => p.id)

    const { data: submissionsData } = await supabase
      .from('task_submissions')
      .select('id, status, tasks(id, title, due_date, priority, programs(title))')
      .eq('apprentice_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    tasksDue = ((submissionsData || []) as any[]).map((s) => {
      const task = Array.isArray(s.tasks) ? s.tasks[0] : s.tasks
      const prog = task ? (Array.isArray(task.programs) ? task.programs[0] : task.programs) : null
      return {
        id: task?.id ?? '',
        title: task?.title ?? '',
        due_date: task?.due_date ?? null,
        priority: task?.priority ?? 'medium',
        program: prog,
      }
    }).filter((t) => t.id)

    const { count: completedCount } = await supabase
      .from('task_submissions').select('*', { count: 'exact', head: true })
      .eq('apprentice_id', user.id).eq('status', 'approved')

    const { count: submittedCount } = await supabase
      .from('task_submissions').select('*', { count: 'exact', head: true })
      .eq('apprentice_id', user.id)

    stats = { programs: programs.length, tasks: submittedCount ?? 0, completed: completedCount ?? 0, apprentices: 0 }
  }

  const statCards = isMentor
    ? [
        { label: 'Active Programs', value: stats.programs, icon: <BookOpen className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Apprentices', value: stats.apprentices, icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
        { label: 'Total Tasks', value: stats.tasks, icon: <CheckSquare className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
      ]
    : [
        { label: 'Enrolled Programs', value: stats.programs, icon: <BookOpen className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Tasks Submitted', value: stats.tasks, icon: <CheckSquare className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
        { label: 'Approved', value: stats.completed, icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
      ]

  return (
    <>
      <Header
        title="Dashboard"
        profile={profile as Profile}
        action={
          isMentor ? (
            <Link href="/programs/new">
              <Button size="sm"><Plus className="w-4 h-4" />New Program</Button>
            </Link>
          ) : (
            <Link href="/programs">
              <Button size="sm" variant="secondary"><BookOpen className="w-4 h-4" />Browse Programs</Button>
            </Link>
          )
        }
      />
      <main className="flex-1 px-8 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
          </h2>
          <p className="text-gray-500 mt-1">
            {isMentor ? "Here's an overview of your programs and apprentices." : "Here's your learning progress at a glance."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 py-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{isMentor ? 'Your Programs' : 'Enrolled Programs'}</h3>
              <Link href="/programs" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <CardContent className="p-0">
              {programs.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {isMentor ? 'No programs yet. Create your first one!' : 'Not enrolled in any programs yet.'}
                  </p>
                  {isMentor && (
                    <Link href="/programs/new" className="mt-3 inline-block">
                      <Button size="sm" variant="outline">Create program</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {programs.map((program) => (
                    <li key={program.id}>
                      <Link href={`/programs/${program.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{program.title}</p>
                            {isMentor && (
                              <p className="text-xs text-gray-400">{program._count.enrollments} apprentice{program._count.enrollments !== 1 ? 's' : ''}</p>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize border ml-2 ${getStatusColor(program.status)}`}>
                          {program.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{isMentor ? 'Recent Tasks Created' : 'My Task Submissions'}</h3>
              <Link href="/tasks" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <CardContent className="p-0">
              {tasksDue.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <CheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No tasks yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {tasksDue.map((task) => {
                    const days = daysUntil(task.due_date)
                    const isOverdue = days !== null && days < 0
                    return (
                      <li key={task.id}>
                        <Link href="/tasks" className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                              <p className="text-xs text-gray-400">{task.program?.title}</p>
                            </div>
                          </div>
                          {task.due_date && (
                            <div className={`flex items-center gap-1 text-xs ml-2 flex-shrink-0 ${isOverdue ? 'text-red-600' : days !== null && days <= 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                              {isOverdue && <AlertCircle className="w-3 h-3" />}
                              <Clock className="w-3 h-3" />
                              {isOverdue ? `${Math.abs(days!)}d overdue` : days === 0 ? 'Today' : formatDate(task.due_date)}
                            </div>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {isMentor && recentActivity.length > 0 && (
          <Card>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Recent Enrollments</h3>
            </div>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-50">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="flex items-center gap-4 px-6 py-3.5">
                    <Avatar name={activity.full_name} src={activity.avatar_url} size="sm" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{activity.full_name}</span>
                      <span className="text-sm text-gray-500"> {activity.action}</span>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">{formatDate(activity.time)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
