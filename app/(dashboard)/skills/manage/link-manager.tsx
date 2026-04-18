'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkedResource } from '@/lib/skills-data'
import { removeLinks, restoreLink } from '@/app/actions/skills'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  ExternalLink,
  RotateCcw,
  Trash2,
  Zap,
} from 'lucide-react'

type LinkStatus = 'unchecked' | 'checking' | 'ok' | 'broken' | 'timeout' | 'error'

interface StatusInfo {
  icon: React.ReactNode
  label: string
  rowClass: string
  badgeClass: string
}

const statusConfig: Record<LinkStatus, StatusInfo> = {
  unchecked: {
    icon: <AlertCircle className="w-4 h-4 text-gray-300" />,
    label: 'Not checked',
    rowClass: '',
    badgeClass: 'bg-gray-100 text-gray-500',
  },
  checking: {
    icon: <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />,
    label: 'Checking…',
    rowClass: 'opacity-60',
    badgeClass: 'bg-indigo-50 text-indigo-500',
  },
  ok: {
    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    label: 'OK',
    rowClass: '',
    badgeClass: 'bg-green-50 text-green-700',
  },
  broken: {
    icon: <XCircle className="w-4 h-4 text-red-500" />,
    label: 'Broken',
    rowClass: 'bg-red-50/40',
    badgeClass: 'bg-red-100 text-red-700',
  },
  timeout: {
    icon: <Clock className="w-4 h-4 text-amber-500" />,
    label: 'Timeout',
    rowClass: 'bg-amber-50/40',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  error: {
    icon: <XCircle className="w-4 h-4 text-red-500" />,
    label: 'Unreachable',
    rowClass: 'bg-red-50/40',
    badgeClass: 'bg-red-100 text-red-700',
  },
}

interface Props {
  linkedResources: LinkedResource[]
  initialRemovedUrls: string[]
}

export function LinkManager({ linkedResources, initialRemovedUrls }: Props) {
  const initialRemovedSet = new Set(initialRemovedUrls)
  const activeLinks = linkedResources.filter((lr) => !initialRemovedSet.has(lr.resource.url!))
  const removedLinks = linkedResources.filter((lr) => initialRemovedSet.has(lr.resource.url!))

  const [statuses, setStatuses] = useState<Record<string, LinkStatus>>(
    Object.fromEntries(activeLinks.map((lr) => [lr.resource.url!, 'unchecked']))
  )
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [removedUrls, setRemovedUrls] = useState<Set<string>>(new Set(initialRemovedUrls))
  const [isChecking, setIsChecking] = useState(false)
  const [isPending, startTransition] = useTransition()

  const currentActiveLinks = linkedResources.filter((lr) => !removedUrls.has(lr.resource.url!))
  const currentRemovedLinks = linkedResources.filter((lr) => removedUrls.has(lr.resource.url!))

  async function checkAllLinks() {
    if (isChecking) return
    setIsChecking(true)
    setStatuses(
      Object.fromEntries(currentActiveLinks.map((lr) => [lr.resource.url!, 'checking']))
    )
    await Promise.all(
      currentActiveLinks.map(async (lr) => {
        const url = lr.resource.url!
        try {
          const res = await fetch(`/api/check-link?url=${encodeURIComponent(url)}`)
          const data: { ok: boolean; status?: number; error?: string } = await res.json()
          let status: LinkStatus = 'ok'
          if (!data.ok) {
            status = data.error === 'timeout' ? 'timeout' : 'broken'
          }
          setStatuses((prev) => ({ ...prev, [url]: status }))
        } catch {
          setStatuses((prev) => ({ ...prev, [url]: 'error' }))
        }
      })
    )
    setIsChecking(false)
  }

  function toggleSelect(url: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(url) ? next.delete(url) : next.add(url)
      return next
    })
  }

  function selectAllBroken() {
    const broken = new Set(
      Object.entries(statuses)
        .filter(([, s]) => s === 'broken' || s === 'timeout' || s === 'error')
        .map(([url]) => url)
    )
    setSelected(broken)
  }

  const brokenCount = Object.values(statuses).filter(
    (s) => s === 'broken' || s === 'timeout' || s === 'error'
  ).length

  function handleRemoveSelected() {
    const urls = Array.from(selected)
    startTransition(async () => {
      await removeLinks(urls)
      setRemovedUrls((prev) => new Set([...prev, ...urls]))
      setStatuses((prev) => {
        const next = { ...prev }
        for (const url of urls) delete next[url]
        return next
      })
      setSelected(new Set())
    })
  }

  function handleRestore(url: string) {
    startTransition(async () => {
      await restoreLink(url)
      setRemovedUrls((prev) => {
        const next = new Set(prev)
        next.delete(url)
        return next
      })
      setStatuses((prev) => ({ ...prev, [url]: 'unchecked' }))
    })
  }

  return (
    <div className="space-y-10">
      {/* Summary + actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span><span className="font-semibold text-gray-900">{currentActiveLinks.length}</span> active links</span>
          <span><span className="font-semibold text-gray-900">{currentRemovedLinks.length}</span> removed</span>
          {brokenCount > 0 && (
            <span className="text-red-600"><span className="font-semibold">{brokenCount}</span> broken detected</span>
          )}
        </div>
        <Button onClick={checkAllLinks} disabled={isChecking || currentActiveLinks.length === 0}>
          {isChecking ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Checking…</>
          ) : (
            <><Zap className="w-4 h-4" />Check All Links</>
          )}
        </Button>
      </div>

      {/* Note for YouTube */}
      <p className="text-xs text-gray-400 -mt-6">
        Note: YouTube links may return OK even if a video has been removed — click to verify manually.
      </p>

      {/* Active links table */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-gray-700">Active Links</h2>
          <div className="flex items-center gap-2">
            {brokenCount > 0 && (
              <Button variant="outline" size="sm" onClick={selectAllBroken}>
                Select All Broken ({brokenCount})
              </Button>
            )}
            {selected.size > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveSelected}
                disabled={isPending}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Remove Selected ({selected.size})
              </Button>
            )}
          </div>
        </div>

        {currentActiveLinks.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-gray-400">
              No active links — all have been removed.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {currentActiveLinks.map((lr) => {
                  const url = lr.resource.url!
                  const cfg = statusConfig[statuses[url] ?? 'unchecked']
                  const isSelected = selected.has(url)
                  return (
                    <div
                      key={url}
                      className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${cfg.rowClass} ${isSelected ? 'bg-red-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(url)}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{lr.resource.title}</p>
                        <p className="text-xs text-gray-400 truncate">{lr.categoryTitle} · {lr.skillTitle}</p>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-500 hover:underline flex items-center gap-1 flex-shrink-0 max-w-[200px] truncate"
                        title={url}
                      >
                        {new URL(url).hostname}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.badgeClass}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Removed links */}
      {currentRemovedLinks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Removed Links</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {currentRemovedLinks.map((lr) => {
                  const url = lr.resource.url!
                  return (
                    <div key={url} className="flex items-center gap-4 px-5 py-3.5 bg-gray-50/60">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 truncate line-through">{lr.resource.title}</p>
                        <p className="text-xs text-gray-400 truncate">{lr.categoryTitle} · {lr.skillTitle}</p>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:underline flex items-center gap-1 flex-shrink-0 max-w-[200px] truncate"
                        title={url}
                      >
                        {new URL(url).hostname}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(url)}
                        disabled={isPending}
                        className="flex-shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
