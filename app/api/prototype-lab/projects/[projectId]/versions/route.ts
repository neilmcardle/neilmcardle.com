import { NextRequest, NextResponse } from 'next/server'
import { createPrototypeVersion, getPrototypeProjectBundle } from '@/lib/db/prototypes'
import { requirePrototypeLabUser } from '@/lib/prototype-lab/server-auth'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const auth = await requirePrototypeLabUser(req)

  if ('error' in auth) {
    return auth.error
  }

  const body = await req.json()
  const { projectId } = await params
  const bundle = await getPrototypeProjectBundle(projectId, auth.dbUser.id)

  if (!bundle) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  const label = typeof body.label === 'string' ? body.label.trim() : ''

  if (!label) {
    return NextResponse.json({ error: 'Version label is required.' }, { status: 400 })
  }

  const files =
    body.files && typeof body.files === 'object' && !Array.isArray(body.files)
      ? body.files
      : bundle.latestVersion?.files ?? {}

  const version = await createPrototypeVersion(projectId, auth.dbUser.id, {
    label,
    prompt: typeof body.prompt === 'string' ? body.prompt : '',
    files,
  })

  return NextResponse.json({ version }, { status: 201 })
}
