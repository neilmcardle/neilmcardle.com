'use client'

import { getWeprayBrowserClient } from '@/lib/wepray/supabase'
import type { Group, PrayerView, PrayerTag } from '@/lib/wepray/types'

const sb = () => getWeprayBrowserClient()

export async function listMyCircles(): Promise<Group[]> {
  const { data, error } = await sb()
    .from('members')
    .select('group_id, groups(*)')
    .order('joined_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as any[])
    .map(row => row.groups as Group)
    .filter(Boolean)
}

export async function getCircle(groupId: string): Promise<Group | null> {
  const { data, error } = await sb().from('groups').select('*').eq('id', groupId).maybeSingle()
  if (error) throw error
  return (data as Group | null) ?? null
}

export async function createCircle(name: string): Promise<Group> {
  const { data, error } = await sb().rpc('create_group', { p_name: name } as any)
  if (error) throw error
  return data as Group
}

export async function joinCircleByCode(code: string): Promise<Group> {
  const { data, error } = await sb().rpc('join_group_by_code', { p_code: code } as any)
  if (error) throw error
  return data as Group
}

export async function listPrayersForGroup(groupId: string, limit = 50): Promise<PrayerView[]> {
  const { data, error } = await sb()
    .from('prayers_view')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as PrayerView[]
}

export async function listRecentPrayersAcrossCircles(limit = 30): Promise<PrayerView[]> {
  const { data, error } = await sb()
    .from('prayers_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as PrayerView[]
}

export async function createPrayer(args: {
  groupId: string
  authorId: string
  body: string
  tag: PrayerTag
  verseRef?: string | null
  verseText?: string | null
}) {
  const { error } = await sb().from('prayers').insert({
    group_id: args.groupId,
    author_id: args.authorId,
    body: args.body,
    tag: args.tag,
    verse_ref: args.verseRef ?? null,
    verse_text: args.verseText ?? null,
  } as any)
  if (error) throw error
}

export async function recordPrayedEvent(args: { prayerId: string; userId: string }) {
  const { error } = await sb().from('prayer_events').insert({
    prayer_id: args.prayerId,
    user_id: args.userId,
  } as any)
  if (error) throw error
}

export async function togglePrayerAnswered(prayerId: string, answered: boolean) {
  const { error } = await sb().from('prayers').update({ answered } as any).eq('id', prayerId)
  if (error) throw error
}

export async function deletePrayer(prayerId: string) {
  const { error } = await sb().from('prayers').delete().eq('id', prayerId)
  if (error) throw error
}

export async function getMemberCount(groupId: string): Promise<number> {
  const { count, error } = await sb()
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)
  if (error) throw error
  return count ?? 0
}
