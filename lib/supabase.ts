import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  username?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'incomplete'
  createdAt: string
  updatedAt: string
}

export interface EBook {
  id: string
  userId: string
  title: string
  author: string
  description?: string
  coverImage?: string
  chapters: Chapter[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: string
  title: string
  content: string
  order: number
}