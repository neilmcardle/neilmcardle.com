import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db/users'

// Prototype Lab is a single-owner internal sandbox with no sign-in.
// All API calls are scoped to whichever user matches PROTOTYPE_LAB_OWNER_EMAIL.
export async function requirePrototypeLabUser(_req: NextRequest) {
  const ownerEmail = process.env.PROTOTYPE_LAB_OWNER_EMAIL

  if (!ownerEmail) {
    return {
      error: NextResponse.json(
        { error: 'PROTOTYPE_LAB_OWNER_EMAIL is not set.' },
        { status: 503 }
      ),
    }
  }

  const { user: dbUser } = await getUserByEmail(ownerEmail)

  if (!dbUser) {
    return {
      error: NextResponse.json(
        { error: `No user found for ${ownerEmail}.` },
        { status: 503 }
      ),
    }
  }

  return { dbUser }
}
