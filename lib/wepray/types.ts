// Hand-written types matching the WePray Supabase schema in
// app/wepray/migrations/0001_initial.sql. If the SQL changes, update here.

export type PrayerTag = 'praise' | 'urgent' | 'ongoing'

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string
}

export interface Group {
  id: string
  name: string
  invite_code: string
  created_by: string
  created_at: string
}

export interface Member {
  group_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
}

export interface Prayer {
  id: string
  group_id: string
  author_id: string
  body: string
  tag: PrayerTag
  verse_ref: string | null
  verse_text: string | null
  answered: boolean
  created_at: string
}

export interface PrayerView extends Prayer {
  author_name: string | null
  prayer_count: number
  i_prayed: boolean
}

export interface PrayerEvent {
  id: string
  prayer_id: string
  user_id: string
  created_at: string
}
