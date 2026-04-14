import { NextRequest, NextResponse } from 'next/server'
import {
  getPrototypeProjectBundle,
  updatePrototypeProject,
} from '@/lib/db/prototypes'
import { requirePrototypeLabUser } from '@/lib/prototype-lab/server-auth'

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const auth = await requirePrototypeLabUser(req)

  if ('error' in auth) {
    return auth.error
  }

  const { projectId } = await params
  const project = await getPrototypeProjectBundle(projectId, auth.dbUser.id)

  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  return NextResponse.json(project)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const auth = await requirePrototypeLabUser(req)

  if ('error' in auth) {
    return auth.error
  }

  const body = await req.json()
  const { projectId } = await params

  const project = await updatePrototypeProject(projectId, auth.dbUser.id, {
    name: typeof body.name === 'string' ? body.name : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
    status: typeof body.status === 'string' ? body.status : undefined,
    previewUrl:
      typeof body.previewUrl === 'string' || body.previewUrl === null
        ? body.previewUrl
        : undefined,
    deploymentUrl:
      typeof body.deploymentUrl === 'string' || body.deploymentUrl === null
        ? body.deploymentUrl
        : undefined,
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  return NextResponse.json({ project })
}
