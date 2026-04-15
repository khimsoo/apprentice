export type Role = 'mentor' | 'apprentice'
export type ProgramStatus = 'draft' | 'active' | 'completed' | 'archived'
export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'withdrawn'
export type TaskPriority = 'low' | 'medium' | 'high'
export type SubmissionStatus = 'pending' | 'submitted' | 'reviewed' | 'approved' | 'needs_revision'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Program {
  id: string
  title: string
  description: string | null
  mentor_id: string
  status: ProgramStatus
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  mentor?: Profile
  enrollments?: Enrollment[]
  milestones?: Milestone[]
  tasks?: Task[]
  _count?: {
    enrollments: number
    tasks: number
  }
}

export interface Enrollment {
  id: string
  program_id: string
  apprentice_id: string
  status: EnrollmentStatus
  enrolled_at: string
  completed_at: string | null
  program?: Program
  apprentice?: Profile
}

export interface Milestone {
  id: string
  program_id: string
  title: string
  description: string | null
  due_date: string | null
  order_index: number
  created_at: string
  progress?: MilestoneProgress[]
}

export interface Task {
  id: string
  program_id: string
  milestone_id: string | null
  title: string
  description: string | null
  due_date: string | null
  priority: TaskPriority
  created_by: string
  created_at: string
  updated_at: string
  program?: Program
  milestone?: Milestone
  submissions?: TaskSubmission[]
}

export interface TaskSubmission {
  id: string
  task_id: string
  apprentice_id: string
  content: string | null
  status: SubmissionStatus
  feedback: string | null
  submitted_at: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  task?: Task
  apprentice?: Profile
}

export interface MilestoneProgress {
  id: string
  milestone_id: string
  apprentice_id: string
  completed: boolean
  completed_at: string | null
}
