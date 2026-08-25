"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createCoverlyUserClient } from "@/lib/coverly/supabase/server";

type ActionResult = { ok: boolean; error?: string; boardId?: string };

async function requireUser() {
  const supabase = await createCoverlyUserClient();
  if (!supabase) return { supabase: null, user: null };
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export async function listMyBoards(): Promise<
  { id: string; name: string }[] | null
> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return null;
  const { data } = await supabase
    .from("boards")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function createBoard(name: string): Promise<ActionResult> {
  const parsed = z.string().trim().min(1).max(120).safeParse(name);
  if (!parsed.success) return { ok: false, error: "Board name required" };

  const { supabase, user } = await requireUser();
  if (!supabase || !user)
    return { ok: false, error: "Sign in to create boards" };

  const { data, error } = await supabase
    .from("boards")
    .insert({ owner_id: user.id, name: parsed.data })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/coverly/boards");
  return { ok: true, boardId: data.id };
}

export async function addCoverToBoard(
  boardId: string,
  coverId: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { ok: false, error: "Sign in to save covers" };

  const { data: last } = await supabase
    .from("board_covers")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("board_covers")
    .upsert(
      {
        board_id: boardId,
        cover_id: coverId,
        position: (last?.position ?? 0) + 1,
      },
      { onConflict: "board_id,cover_id" },
    );
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/coverly/boards/${boardId}`);
  return { ok: true };
}
