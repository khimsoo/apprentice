import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import { Profile } from '@/types/database'
import { ProfileForm } from './profile-form'
import { GraduationCap, Calendar, BookOpen, CheckSquare } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isMentor = profile?.role === 'mentor'

  // Stats
  let programCount = 0
  let taskCount = 0

  if (isMentor) {
    const { count: pc } = await supabase
      .from('programs').select('*', { count: 'exact', head: true }).eq('mentor_id', user.id)
    const { count: tc } = await supabase
      .from('tasks').select('*', { count: 'exact', head: true }).eq('created_by', user.id)
    programCount = pc ?? 0
    taskCount = tc ?? 0
  } else {
    const { count: ec } = await supabase
      .from('enrollments').select('*', { count: 'exact', head: true }).eq('apprentice_id', user.id)
    const { count: sc } = await supabase
      .from('task_submissions').select('*', { count: 'exact', head: true }).eq('apprentice_id', user.id).eq('status', 'approved')
    programCount = ec ?? 0
    taskCount = sc ?? 0
  }

  return (
    <>
      <Header title="Profile" profile={profile as Profile} />
      <main className="flex-1 px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile card */}
          <Card>
            <CardContent className="py-8 flex flex-col items-center text-center">
              <Avatar name={profile?.full_name} src={profile?.avatar_url} size="xl" className="mb-4" />
              <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Your Name'}</h2>
              <p className="text-gray-500 text-sm mt-1">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${isMentor ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {isMentor ? '🏫 Mentor' : '🎓 Apprentice'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-100 w-full">
                <div className="text-center">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{programCount}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{isMentor ? 'Programs Created' : 'Programs Enrolled'}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{taskCount}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{isMentor ? 'Tasks Created' : 'Tasks Approved'}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{formatDate(profile?.created_at)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Member since</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit form */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Edit Profile</h3>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile as Profile} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
