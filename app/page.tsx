import Link from 'next/link'
import { GraduationCap, CheckCircle, Users, BarChart3, ArrowRight, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Apprentice</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star className="w-3.5 h-3.5" />
            Built for modern apprenticeship programs
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Track every step of your{' '}
            <span className="text-indigo-600">apprenticeship journey</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Apprentice helps mentors and apprentices stay aligned — manage programs, track
            tasks, monitor progress, and celebrate milestones together.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* Preview mockup */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="flex-1 mx-4">
                <div className="bg-gray-700 rounded h-6 flex items-center px-3">
                  <span className="text-gray-400 text-xs">apprentice.app/dashboard</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 grid grid-cols-4 gap-4 min-h-64">
              <div className="col-span-1 bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-indigo-600 rounded" />
                  <div className="h-3 w-20 bg-indigo-200 rounded-full" />
                </div>
                {['Dashboard', 'Programs', 'Tasks', 'Profile'].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 p-2 rounded-lg ${i === 0 ? 'bg-indigo-50' : ''}`}>
                    <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-indigo-400' : 'bg-gray-200'}`} />
                    <div className={`h-2.5 rounded-full ${i === 0 ? 'w-16 bg-indigo-300' : 'w-14 bg-gray-200'}`} />
                  </div>
                ))}
              </div>
              <div className="col-span-3 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Active Programs', val: '3', color: 'indigo' },
                    { label: 'Tasks Due', val: '7', color: 'amber' },
                    { label: 'Completed', val: '24', color: 'green' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-lg p-4">
                      <div className="text-2xl font-bold text-indigo-600">{stat.val}</div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="h-3 w-32 bg-gray-200 rounded-full mb-3" />
                  {[80, 65, 45].map((w, i) => (
                    <div key={i} className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100" />
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-indigo-400 h-2 rounded-full" style={{ width: `${w}%` }} />
                      </div>
                      <div className="text-xs text-gray-400">{w}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to run a great program
            </h2>
            <p className="text-gray-500 text-lg">
              Purpose-built tools for mentors and apprentices to collaborate effectively.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-6 h-6 text-indigo-600" />,
                title: 'Program Management',
                desc: 'Create structured programs with milestones, enroll apprentices, and track cohort progress at a glance.',
              },
              {
                icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                title: 'Task Tracking',
                desc: 'Assign tasks with due dates and priorities. Apprentices submit work; mentors review and give feedback.',
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-amber-600" />,
                title: 'Progress Insights',
                desc: "Visual dashboards show each apprentice's completion rates, upcoming deadlines, and overall trajectory.",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-3">For Mentors</h3>
            <p className="text-indigo-200 mb-6">Lead with structure and clarity.</p>
            <ul className="space-y-3">
              {[
                'Create and manage programs',
                'Assign tasks with priorities',
                'Review submissions and give feedback',
                'Track apprentice progress',
                'Set milestones and deadlines',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-indigo-300 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">For Apprentices</h3>
            <p className="text-gray-500 mb-6">Learn with focus and direction.</p>
            <ul className="space-y-3">
              {[
                'Enroll in structured programs',
                'View and complete assigned tasks',
                'Submit work for review',
                'Track your own progress',
                'See upcoming milestones',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Join programs designed to accelerate learning and career growth.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Create your free account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Apprentice</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Apprentice. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
