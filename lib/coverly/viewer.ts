import { createCoverlyUserClient } from "./supabase/server";
import { isAdminEmail } from "@/lib/admin";

export type Viewer = {
  user: { id: string; email: string | null } | null;
  isAdmin: boolean;
};

export async function getCoverlyViewer(): Promise<Viewer> {
  const supabase = await createCoverlyUserClient();
  if (!supabase) return { user: null, isAdmin: false };

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { user: null, isAdmin: false };

  return {
    user: { id: user.id, email: user.email ?? null },
    isAdmin: isAdminEmail(user.email),
  };
}
