'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { Send, X, CheckCircle } from 'lucide-react'

interface SubmitTaskButtonProps {
  taskId: string
  apprenticeId: string
  submission: { id: string; status: string; content: string | null; feedback: string | null } | null
}

export function SubmitTaskButton({ taskId, apprenticeId, submission }: SubmitTaskButtonProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(submission?.content ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const isApproved = submission?.status === 'approved'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const now = new Date().toISOString()

    if (submission) {
      const { error: err } = await supabase
        .from('task_submissions')
        .update({ content, status: 'submitted', submitted_at: now })
        .eq('id', submission.id)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase
        .from('task_submissions')
        .insert({ task_id: taskId, apprentice_id: apprenticeId, content, status: 'submitted', submitted_at: now })
      if (err) { setError(err.message); setLoading(false); return }
    }

    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  if (isApproved) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        Approved
      </span>
    )
  }

  return (
    <>
      <Button size="sm" variant={submission ? 'secondary' : 'primary'} onClick={() => setOpen(true)}>
        <Send className="w-3.5 h-3.5" />
        {submission ? 'Update' : 'Submit'}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{submission ? 'Update Submission' : 'Submit Task'}</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Textarea
                label="Your submission"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your work, paste a link, or explain what you completed..."
                rows={5}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-3">
                <Button type="submit" loading={loading} className="flex-1">
                  <Send className="w-4 h-4" />
                  {submission ? 'Update submission' : 'Submit for review'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
