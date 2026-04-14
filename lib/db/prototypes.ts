import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  prototypeComments,
  prototypeProjects,
  prototypeVersions,
  type PrototypeComment,
  type PrototypeFileMap,
  type PrototypeProject,
  type PrototypeProjectStatus,
  type PrototypeVersion,
} from '@/lib/db/schema'
import { getPrototypeTemplate } from '@/lib/prototype-lab/templates'

function slugifyPrototypeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'prototype'
}

async function generateUniquePrototypeSlug(name: string) {
  const baseSlug = slugifyPrototypeName(name)
  let attempt = baseSlug
  let counter = 2

  while (true) {
    const existing = await db.query.prototypeProjects.findFirst({
      where: eq(prototypeProjects.slug, attempt),
      columns: { id: true },
    })

    if (!existing) {
      return attempt
    }

    attempt = `${baseSlug}-${counter}`
    counter += 1
  }
}

export async function listPrototypeProjectsForUser(userId: string) {
  const projects = await db.query.prototypeProjects.findMany({
    where: eq(prototypeProjects.userId, userId),
    orderBy: [desc(prototypeProjects.updatedAt)],
  })

  return Promise.all(
    projects.map(async (project) => {
      const latestVersion = project.latestVersionId
        ? await db.query.prototypeVersions.findFirst({
            where: eq(prototypeVersions.id, project.latestVersionId),
          })
        : null

      const comments = await db.query.prototypeComments.findMany({
        where: eq(prototypeComments.projectId, project.id),
        columns: { id: true, resolved: true },
      })

      return {
        ...project,
        latestVersion,
        commentCount: comments.length,
        openCommentCount: comments.filter((comment) => !comment.resolved).length,
      }
    })
  )
}

export async function getPrototypeProjectBundle(projectId: string, userId: string) {
  const project = userId
    ? await db.query.prototypeProjects.findFirst({
        where: and(
          eq(prototypeProjects.id, projectId),
          eq(prototypeProjects.userId, userId)
        ),
      })
    : await db.query.prototypeProjects.findFirst({
        where: eq(prototypeProjects.id, projectId),
      })

  if (!project) {
    return null
  }

  const [versions, comments] = await Promise.all([
    db.query.prototypeVersions.findMany({
      where: eq(prototypeVersions.projectId, projectId),
      orderBy: [desc(prototypeVersions.createdAt)],
    }),
    db.query.prototypeComments.findMany({
      where: eq(prototypeComments.projectId, projectId),
      orderBy: [desc(prototypeComments.createdAt)],
    }),
  ])

  return {
    project,
    versions,
    comments,
    latestVersion:
      versions.find((version) => version.id === project.latestVersionId) ?? versions[0] ?? null,
  }
}

interface CreatePrototypeProjectInput {
  name: string
  description?: string
  templateKey?: string
  prompt?: string
}

export async function createPrototypeProject(
  userId: string,
  input: CreatePrototypeProjectInput
) {
  const template = getPrototypeTemplate(input.templateKey ?? 'blank-next')
  const slug = await generateUniquePrototypeSlug(input.name)
  const now = new Date()

  return db.transaction(async (tx) => {
    const [project] = await tx
      .insert(prototypeProjects)
      .values({
        userId,
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || template.description,
        templateKey: template.key,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    const [version] = await tx
      .insert(prototypeVersions)
      .values({
        projectId: project.id,
        createdByUserId: userId,
        label: 'Initial draft',
        prompt: input.prompt?.trim() || `Created from the ${template.name} template`,
        status: 'draft',
        files: template.files,
        createdAt: now,
      })
      .returning()

    const [updatedProject] = await tx
      .update(prototypeProjects)
      .set({
        latestVersionId: version.id,
        updatedAt: now,
      })
      .where(eq(prototypeProjects.id, project.id))
      .returning()

    return {
      project: updatedProject,
      version,
      template,
    }
  })
}

interface UpdatePrototypeProjectInput {
  name?: string
  description?: string
  status?: PrototypeProjectStatus
  previewUrl?: string | null
  deploymentUrl?: string | null
}

export async function updatePrototypeProject(
  projectId: string,
  userId: string,
  input: UpdatePrototypeProjectInput
) {
  const updates: Partial<PrototypeProject> = {
    updatedAt: new Date(),
  }

  if (typeof input.name === 'string' && input.name.trim()) {
    updates.name = input.name.trim()
  }

  if (typeof input.description === 'string') {
    updates.description = input.description.trim()
  }

  if (input.status) {
    updates.status = input.status
  }

  if (input.previewUrl !== undefined) {
    updates.previewUrl = input.previewUrl
  }

  if (input.deploymentUrl !== undefined) {
    updates.deploymentUrl = input.deploymentUrl
  }

  const [project] = await db
    .update(prototypeProjects)
    .set(updates)
    .where(
      and(eq(prototypeProjects.id, projectId), eq(prototypeProjects.userId, userId))
    )
    .returning()

  return project ?? null
}

interface CreatePrototypeVersionInput {
  label: string
  prompt?: string
  files: PrototypeFileMap
}

export async function createPrototypeVersion(
  projectId: string,
  userId: string,
  input: CreatePrototypeVersionInput
) {
  const now = new Date()

  const [version] = await db
    .insert(prototypeVersions)
    .values({
      projectId,
      createdByUserId: userId,
      label: input.label.trim(),
      prompt: input.prompt?.trim(),
      status: 'draft',
      files: input.files,
      createdAt: now,
    })
    .returning()

  await db
    .update(prototypeProjects)
    .set({
      latestVersionId: version.id,
      updatedAt: now,
    })
    .where(and(eq(prototypeProjects.id, projectId), eq(prototypeProjects.userId, userId)))

  return version
}

interface CreatePrototypeCommentInput {
  body: string
  targetPath?: string
  targetNode?: string
}

export async function createPrototypeComment(
  projectId: string,
  userId: string,
  input: CreatePrototypeCommentInput
) {
  const now = new Date()

  const [comment] = await db
    .insert(prototypeComments)
    .values({
      projectId,
      authorUserId: userId,
      targetPath: input.targetPath?.trim() || null,
      targetNode: input.targetNode?.trim() || null,
      body: input.body.trim(),
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  await db
    .update(prototypeProjects)
    .set({ updatedAt: now })
    .where(and(eq(prototypeProjects.id, projectId), eq(prototypeProjects.userId, userId)))

  return comment
}

export async function setPrototypeCommentResolved(
  commentId: string,
  projectId: string,
  userId: string,
  resolved: boolean
) {
  const project = await db.query.prototypeProjects.findFirst({
    where: and(eq(prototypeProjects.id, projectId), eq(prototypeProjects.userId, userId)),
    columns: { id: true },
  })

  if (!project) {
    return null
  }

  const [comment] = await db
    .update(prototypeComments)
    .set({
      resolved,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(prototypeComments.id, commentId),
        eq(prototypeComments.projectId, projectId)
      )
    )
    .returning()

  return comment ?? null
}

export type PrototypeProjectListItem = Awaited<
  ReturnType<typeof listPrototypeProjectsForUser>
>[number]

export interface PrototypeProjectBundle {
  project: PrototypeProject
  versions: PrototypeVersion[]
  comments: PrototypeComment[]
  latestVersion: PrototypeVersion | null
}
