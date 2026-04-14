import { NextRequest, NextResponse } from 'next/server'
import {
  createPrototypeProject,
  listPrototypeProjectsForUser,
} from '@/lib/db/prototypes'
import { requirePrototypeLabUser } from '@/lib/prototype-lab/server-auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const auth = await requirePrototypeLabUser(req)

  if ('error' in auth) {
    return auth.error
  }

  const projects = await listPrototypeProjectsForUser(auth.dbUser.id)
  return NextResponse.json({ projects })
}

export async function POST(req: NextRequest) {
  const auth = await requirePrototypeLabUser(req)

  if ('error' in auth) {
    return auth.error
  }

  const body = await req.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''

  if (!name) {
    return NextResponse.json({ error: 'Project name is required.' }, { status: 400 })
  }

  const created = await createPrototypeProject(auth.dbUser.id, {
    name,
    description: typeof body.description === 'string' ? body.description : '',
    templateKey: typeof body.templateKey === 'string' ? body.templateKey : 'blank-next',
    prompt: typeof body.prompt === 'string' ? body.prompt : '',
  })

  return NextResponse.json(created, { status: 201 })
}
