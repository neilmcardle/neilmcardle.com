import { NextResponse } from "next/server";
import { createCoverlyUserClient } from "@/lib/coverly/supabase/server";

export async function POST(request: Request) {
  const supabase = await createCoverlyUserClient();
  if (supabase) await supabase.auth.signOut();
  return NextResponse.redirect(
    new URL("/coverly", new URL(request.url).origin),
    { status: 303 },
  );
}
