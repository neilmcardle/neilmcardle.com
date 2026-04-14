'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

type PrototypeDetail = {
  project: {
    id: string
    name: string
    slug: string
    description: string | null
    templateKey: string
    status: 'draft' | 'review' | 'shared' | 'archived'
    previewUrl: string | null
    deploymentUrl: string | null
    createdAt: string
    updatedAt: string
  }
  latestVersion: {
    id: string
    label: string
    prompt: string | null
    files: Record<string, string>
    createdAt: string
  } | null
  versions: Array<{
    id: string
    label: string
    prompt: string | null
    createdAt: string
  }>
  comments: Array<{
    id: string
    body: string
    targetPath: string | null
    resolved: boolean
    createdAt: string
  }>
}

const statuses = ['draft', 'review', 'shared', 'archived'] as const

function statusTone(status: string) {
  switch (status) {
    case 'review':
      return 'bg-amber-50 text-amber-800 ring-amber-200'
    case 'shared':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    case 'archived':
      return 'bg-zinc-100 text-zinc-600 ring-zinc-200'
    default:
      return 'bg-zinc-900 text-white ring-zinc-900'
  }
}

export default function PrototypeLabProjectPage() {
  const { user, loading } = useAuth()
  const params = useParams<{ projectId: string }>()
  const projectId = typeof params.projectId === 'string' ? params.projectId : ''

  const [detail, setDetail] = useState<PrototypeDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentPath, setCommentPath] = useState('app/page.tsx')
  const [newVersionLabel, setNewVersionLabel] = useState('')
  const [newVersionPrompt, setNewVersionPrompt] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [deploymentUrl, setDeploymentUrl] = useState('')

  async function loadProject() {
    if (!projectId) return

    setFetching(true)
    setError(null)

    try {
      const response = await fetch(`/api/prototype-lab/projects/${projectId}`, {
        cache: 'no-store',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load project.')
      }

      setDetail(data)
      setPreviewUrl(data.project.previewUrl || '')
      setDeploymentUrl(data.project.deploymentUrl || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project.')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (user && projectId) {
      void loadProject()
    }
  }, [user, projectId])

  async function patchProject(payload: Record<string, unknown>) {
    const response = await fetch(`/api/prototype-lab/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update project.')
    }

    await loadProject()
  }

  async function handleStatusChange(status: (typeof statuses)[number]) {
    setSaving(true)
    setError(null)

    try {
      await patchProject({ status })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveLinks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await patchProject({
        previewUrl: previewUrl.trim() || null,
        deploymentUrl: deploymentUrl.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save links.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!newComment.trim()) {
      setError('Write a comment before posting it.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/prototype-lab/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: newComment,
          targetPath: commentPath,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add comment.')
      }

      setNewComment('')
      await loadProject()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment.')
    } finally {
      setSaving(false)
    }
  }

  async function handleResolveComment(commentId: string, resolved: boolean) {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/prototype-lab/projects/${projectId}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, resolved }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update comment.')
      }

      await loadProject()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!detail?.latestVersion) {
      setError('You need an initial version before snapshotting a new one.')
      return
    }

    if (!newVersionLabel.trim()) {
      setError('Version label is required.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/prototype-lab/projects/${projectId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newVersionLabel,
          prompt: newVersionPrompt,
          files: detail.latestVersion.files,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create version.')
      }

      setNewVersionLabel('')
      setNewVersionPrompt('')
      await loadProject()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create version.')
    } finally {
      setSaving(false)
    }
  }

  const fileEntries = useMemo(
    () => Object.entries(detail?.latestVersion?.files || {}),
    [detail?.latestVersion?.files]
  )

  if (loading || fetching) {
    return <div className="min-h-screen bg-[#f7f7f5] p-10 text-zinc-900">Loading project...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] p-10 text-zinc-900">
        <p className="text-lg">Sign in first to view Prototype Lab projects.</p>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] p-10 text-zinc-900">
        <Link href="/prototype-lab" className="text-sm text-zinc-500 underline-offset-4 hover:underline">
          Back to Prototype Lab
        </Link>
        <p className="mt-6 text-lg">{error || 'Project not found.'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="grid gap-6 rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)] lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <Link href="/prototype-lab" className="text-xs uppercase tracking-[0.24em] text-zinc-500 transition hover:text-zinc-900">
              Prototype Lab / Back
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-5xl font-medium tracking-[-0.05em] text-zinc-950">{detail.project.name}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusTone(detail.project.status)}`}>
                {detail.project.status}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600">
              {detail.project.description || 'No project brief yet. Add context so others understand what this prototype is testing.'}
            </p>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-black/8 bg-[#fafaf9] p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-black/8 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Versions</p>
                <p className="mt-2 text-3xl tracking-[-0.04em] text-zinc-950">{detail.versions.length}</p>
              </div>
              <div className="rounded-3xl border border-black/8 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Open comments</p>
                <p className="mt-2 text-3xl tracking-[-0.04em] text-zinc-950">
                  {detail.comments.filter((comment) => !comment.resolved).length}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Status</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={saving || status === detail.project.status}
                    onClick={() => void handleStatusChange(status)}
                    className={`rounded-full px-3 py-2 text-xs font-medium ring-1 transition disabled:cursor-not-allowed ${
                      detail.project.status === status
                        ? statusTone(status)
                        : 'bg-white text-zinc-700 ring-black/10 hover:ring-zinc-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-8">
            <section className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Latest Version</p>
                  <h2 className="mt-3 text-3xl tracking-[-0.04em] text-zinc-950">
                    {detail.latestVersion?.label || 'No version yet'}
                  </h2>
                </div>
                <div className="rounded-full border border-black/10 px-3 py-1 text-xs text-zinc-600">
                  {detail.latestVersion ? new Date(detail.latestVersion.createdAt).toLocaleDateString() : 'Pending'}
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-600">
                {detail.latestVersion?.prompt || 'No creation prompt captured for this version yet.'}
              </p>

              <div className="mt-6 grid gap-4">
                {fileEntries.map(([path, content]) => (
                  <div key={path} className="overflow-hidden rounded-[28px] border border-black/8 bg-[#fafaf9]">
                    <div className="border-b border-black/8 px-4 py-3">
                      <p className="text-sm font-medium text-zinc-950">{path}</p>
                    </div>
                    <pre className="max-h-[420px] overflow-auto px-4 py-4 text-xs leading-6 text-zinc-700">
                      <code>{content}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Version History</p>
              <h2 className="mt-3 text-3xl tracking-[-0.04em] text-zinc-950">Snapshot the next iteration.</h2>

              <form onSubmit={handleCreateVersion} className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-800">Version label</span>
                  <input
                    value={newVersionLabel}
                    onChange={(event) => setNewVersionLabel(event.target.value)}
                    placeholder="V2: mobile-first trust layout"
                    className="rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-800">What changed in this version?</span>
                  <textarea
                    value={newVersionPrompt}
                    onChange={(event) => setNewVersionPrompt(event.target.value)}
                    rows={4}
                    placeholder="Reworked the hierarchy, simplified the CTA stack, and prepared the prototype for stakeholder review."
                    className="resize-none rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {saving ? 'Saving...' : 'Create version snapshot'}
                </button>
              </form>

              <div className="mt-6 grid gap-3">
                {detail.versions.map((version) => (
                  <div key={version.id} className="rounded-[24px] border border-black/8 bg-[#fafaf9] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-950">{version.label}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {new Date(version.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {version.prompt ? (
                      <p className="mt-3 text-sm leading-6 text-zinc-600">{version.prompt}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-8">
            <section className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Share Links</p>
              <h2 className="mt-3 text-3xl tracking-[-0.04em] text-zinc-950">Attach preview and deployment URLs.</h2>
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                This is where the future internal preview pipeline plugs in. For now, it gives the team a single source of truth for review links.
              </p>

              <form onSubmit={handleSaveLinks} className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-800">Preview URL</span>
                  <input
                    value={previewUrl}
                    onChange={(event) => setPreviewUrl(event.target.value)}
                    placeholder="https://prototype-preview.internal/checkout-v2"
                    className="rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-800">Deployment URL</span>
                  <input
                    value={deploymentUrl}
                    onChange={(event) => setDeploymentUrl(event.target.value)}
                    placeholder="https://prototype-share.internal/checkout-v2"
                    className="rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-zinc-900 transition hover:border-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
                >
                  Save links
                </button>
              </form>
            </section>

            <section className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Feedback Layer</p>
              <h2 className="mt-3 text-3xl tracking-[-0.04em] text-zinc-950">Keep comments close to the prototype.</h2>

              <form onSubmit={handleAddComment} className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-800">Target file</span>
                  <input
                    value={commentPath}
                    onChange={(event) => setCommentPath(event.target.value)}
                    className="rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-800">Comment</span>
                  <textarea
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    rows={4}
                    placeholder="The hero reads well, but the CTA hierarchy still feels too even."
                    className="resize-none rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  Add feedback
                </button>
              </form>

              <div className="mt-6 grid gap-3">
                {detail.comments.map((comment) => (
                  <div key={comment.id} className="rounded-[24px] border border-black/8 bg-[#fafaf9] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {comment.targetPath || 'General'}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-zinc-700">{comment.body}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleResolveComment(comment.id, !comment.resolved)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
                          comment.resolved
                            ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                            : 'bg-white text-zinc-700 ring-black/10 hover:ring-zinc-900'
                        }`}
                      >
                        {comment.resolved ? 'Resolved' : 'Open'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">What This V1 Covers</p>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-zinc-600">
                <li>Authenticated internal projects for code prototypes</li>
                <li>Template-based starting points for new concepts</li>
                <li>Version snapshots with captured prompts</li>
                <li>Comment threads tied to files or areas of the prototype</li>
                <li>Preview and deployment link storage for internal sharing</li>
              </ul>
            </section>
          </div>
        </section>
      </div>
    </div>
  )
}
