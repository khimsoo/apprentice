'use client'

import { useState, useTransition } from 'react'
import { approveApplication, rejectApplication } from '@/app/actions/enrollments'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface Props {
  enrollmentId: string
  programId: string
}

export function ApplicantActions({ enrollmentId, programId }: Props) {
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    startTransition(async () => {
      await approveApplication(enrollmentId, programId)
      setDone('approved')
    })
  }

  function handleReject() {
    startTransition(async () => {
      await rejectApplication(enrollmentId, programId)
      setDone('rejected')
    })
  }

  if (done === 'approved') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-green-600">
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
      </span>
    )
  }

  if (done === 'rejected') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      ) : (
        <>
          <button
            onClick={handleApprove}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
          >
            Reject
          </button>
        </>
      )}
    </div>
  )
}
