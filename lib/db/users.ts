import { eq } from 'drizzle-orm'
import { db } from './index'
import { users, type NewUser } from './schema'

export async function createUser(userData: {
  id: string
  email: string
  username?: string
}) {
  try {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        username: userData.username,
      })
      .returning()
    
    return { user, error: null }
  } catch (error) {
    console.error('Error creating user:', error)
    return { user: null, error }
  }
}

export async function getUserById(id: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    
    return { user: user || null, error: null }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { user: null, error }
  }
}

export async function updateUser(id: string, updates: Partial<NewUser>) {
  try {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    
    return { user, error: null }
  } catch (error) {
    console.error('Error updating user:', error)
    return { user: null, error }
  }
}