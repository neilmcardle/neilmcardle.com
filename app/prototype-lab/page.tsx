'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import type { PrototypeProjectListItem } from '@/lib/db/prototypes'

type TemplateKey = 'blank-next' | 'experiment-idea'

const templateMeta: Record<
  TemplateKey,
  { name: string; description: string; accent: string }
> = {
  'blank-next': {
    name: 'Blank Next.js shell',
    description: 'A clean React starting point for flows, experiments, and coded mockups.',
    accent: 'border-black/15 bg-white',
  },
  'experiment-idea': {
    name: 'Experiment idea starter',
    description: 'A more narrative frame for AB tests, stakeholder walkthroughs, and quick pilots.',
    accent: 'border-sky-200 bg-sky-50/70',
  },
}

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

export default function PrototypeLabPage() {
  const { user, loading } = useAuth()
  const [projects, setProjects] = useState<PrototypeProjectListItem[]>([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [templateKey, setTemplateKey] = useState<TemplateKey>('blank-next')

  async function loadProjects() {
    setFetching(true)
    setError(null)

    try {
      const response = await fetch('/api/prototype-lab/projects', { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load projects.')
      }

      setProjects(data.projects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects.')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (user) {
      void loadProjects()
    }
  }, [user])

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      setError('Give the prototype a name before creating it.')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/prototype-lab/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          prompt,
          templateKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project.')
      }

      setName('')
      setDescription('')
      setPrompt('')
      setProjects((current) => [data.project, ...current])
      window.location.href = `/prototype-lab/${data.project.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project.')
    } finally {
      setCreating(false)
    }
  }

  const activeCount = useMemo(
    () => projects.filter((project) => project.status !== 'archived').length,
    [projects]
  )

  if (loading) {
    return <div className="min-h-screen bg-[#f7f7f5] text-zinc-900 p-10">Loading Prototype Lab...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] text-zinc-900 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Prototype Lab</p>
          <h1 className="mt-4 text-4xl tracking-[-0.04em] text-zinc-950">Sign in to access the internal prototype workspace.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
            This V1 is designed as a place where designers can spin up code-based prototypes, keep lightweight
            version history, and share internal preview links without leaving this stack.
          </p>
          <Link
            href="/make-ebook/signin"
            className="mt-8 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-8 lg:px-10">
        <header className="grid gap-6 rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.06)] lg:grid-cols-[1.5fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Internal Tool / V1</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-medium tracking-[-0.05em] text-zinc-950">
              Prototype Lab for coded concepts, internal previews, and quick iteration loops.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
              Think of this as the smallest version of the system we discussed: a place to create prototype projects,
              snapshot versions, collect feedback, and eventually attach real preview and deployment URLs.
            </p>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-black/8 bg-[#fafaf9] p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Signed in</p>
              <p className="mt-2 text-sm font-medium text-zinc-950">{user.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-black/8 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Projects</p>
                <p className="mt-2 text-3xl tracking-[-0.04em] text-zinc-950">{projects.length}</p>
              </div>
              <div className="rounded-3xl border border-black/8 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Active</p>
                <p className="mt-2 text-3xl tracking-[-0.04em] text-zinc-950">{activeCount}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.25fr]">
          <form
            onSubmit={handleCreateProject}
            className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Create Prototype</p>
                <h2 className="mt-3 text-3xl tracking-[-0.04em] text-zinc-950">Start a new internal concept.</h2>
              </div>
              <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-zinc-600">Codex-ready</span>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-800">Project name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="ABG checkout rethink"
                  className="rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-800">What is this trying to explore?</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="A short brief for the prototype so everyone can see the point of the work."
                  className="resize-none rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-800">Prompt for the first version</span>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={5}
                  placeholder="Build a mobile-first booking flow using our internal components and a higher-trust checkout rhythm."
                  className="resize-none rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm outline-none transition focus:border-zinc-900"
                />
              </label>

              <div className="grid gap-3">
                <span className="text-sm font-medium text-zinc-800">Starting template</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.entries(templateMeta) as [TemplateKey, (typeof templateMeta)[TemplateKey]][]).map(
                    ([key, template]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTemplateKey(key)}
                        className={`rounded-[24px] border p-4 text-left transition ${
                          templateKey === key
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : template.accent
                        }`}
                      >
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className={`mt-2 text-sm leading-6 ${templateKey === key ? 'text-white/75' : 'text-zinc-600'}`}>
                          {template.description}
                        </p>
                      </button>
                    )
                  )}
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {creating ? 'Creating project...' : 'Create prototype project'}
              </button>
            </div>
          </form>

          <section className="rounded-[32px] border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Projects</p>
                <h2 className="mt-3 text-3xl tracking-[-0.04em] text-zinc-950">Current prototypes</h2>
              </div>
              <button
                type="button"
                onClick={() => void loadProjects()}
                className="rounded-full border border-black/10 px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950"
              >
                {fetching ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {projects.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-black/12 bg-[#fafaf9] px-6 py-12 text-center">
                  <p className="text-lg tracking-[-0.02em] text-zinc-950">No prototype projects yet.</p>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
                    Create the first one on the left and this area becomes your internal index of active concepts,
                    experiments, and reviewable versions.
                  </p>
                </div>
              ) : (
                projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/prototype-lab/${project.id}`}
                    className="grid gap-4 rounded-[28px] border border-black/8 bg-[#fafaf9] p-5 transition hover:border-zinc-950 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{project.templateKey}</p>
                        <h3 className="mt-2 text-2xl tracking-[-0.03em] text-zinc-950">{project.name}</h3>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusTone(project.status)}`}>
                        {project.status}
                      </span>
                    </div>

                    <p className="max-w-2xl text-sm leading-6 text-zinc-600">
                      {project.description || 'No written brief yet. Open the project and add one.'}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-3xl border border-black/8 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Latest version</p>
                        <p className="mt-2 text-sm font-medium text-zinc-950">
                          {project.latestVersion?.label || 'No versions'}
                        </p>
                      </div>
                      <div className="rounded-3xl border border-black/8 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Open comments</p>
                        <p className="mt-2 text-sm font-medium text-zinc-950">{project.openCommentCount}</p>
                      </div>
                      <div className="rounded-3xl border border-black/8 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Preview link</p>
                        <p className="mt-2 truncate text-sm font-medium text-zinc-950">
                          {project.previewUrl || 'Not connected yet'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
