import { NextRequest, NextResponse } from 'next/server'
import {
  createPrototypeComment,
  getPrototypeProjectBundle,
  setPrototypeCommentResolved,
} from '@/lib/db/prototypes'
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

  const commentBody = typeof body.body === 'string' ? body.body.trim() : ''

  if (!commentBody) {
    return NextResponse.json({ error: 'Comment body is required.' }, { status: 400 })
  }

  const comment = await createPrototypeComment(projectId, auth.dbUser.id, {
    body: commentBody,
    targetPath: typeof body.targetPath === 'string' ? body.targetPath : '',
    targetNode: typeof body.targetNode === 'string' ? body.targetNode : '',
  })

  return NextResponse.json({ comment }, { status: 201 })
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

  const commentId = typeof body.commentId === 'string' ? body.commentId : ''

  if (!commentId) {
    return NextResponse.json({ error: 'Comment id is required.' }, { status: 400 })
  }

  const comment = await setPrototypeCommentResolved(
    commentId,
    projectId,
    auth.dbUser.id,
    Boolean(body.resolved)
  )

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
  }

  return NextResponse.json({ comment })
}
