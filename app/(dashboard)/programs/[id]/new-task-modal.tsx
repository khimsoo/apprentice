'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

interface Milestone { id: string; title: string }

interface NewTaskModalProps {
  programId: string
  milestones: Milestone[]
}

export function NewTaskModal({ programId, milestones }: NewTaskModalProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [milestoneId, setMilestoneId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase.from('tasks').insert({
      program_id: programId,
      milestone_id: milestoneId || null,
      title,
      description: description || null,
      priority,
      due_date: dueDate || null,
      created_by: user.id,
    })

    if (err) { setError(err.message); setLoading(false); return }

    setOpen(false)
    setTitle(''); setDescription(''); setPriority('medium'); setDueDate(''); setMilestoneId('')
    router.refresh()
    setLoading(false)
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" />
        Add Task
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Add Task</h2>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Task title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Build a REST API" required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what the apprentice should do..." rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
            <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          {milestones.length > 0 && (
            <Select
              label="Milestone (optional)"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              options={[
                { value: '', label: '— No milestone —' },
                ...milestones.map((m) => ({ value: m.id, label: m.title })),
              ]}
            />
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">Create Task</Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
