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