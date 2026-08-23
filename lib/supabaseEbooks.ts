import { getSupabaseBrowserClient } from "./supabase";
import { v4 as uuidv4 } from "uuid";

function isUuid(str: unknown) {
  if (typeof str !== "string") return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    str,
  );
}

interface EbookInput {
  id?: string;
  title?: string;
  author?: string;
  blurb?: string;
  publisher?: string;
  pubDate?: string;
  isbn?: string;
  language?: string;
  genre?: string;
  tags?: string[];
  coverFile?: string | null;
  endnotes?: unknown[];
  endnoteReferences?: unknown[];
}

interface ChapterInput {
  id: string;
  title: string;
  content: string;
  type: string;
}

export async function saveEbookToSupabase(
  ebook: EbookInput,
  chapters: ChapterInput[],
  userId: string,
) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  const supabaseId = isUuid(ebook.id) ? ebook.id! : uuidv4();
  const supabaseEbook = {
    id: supabaseId,
    user_id: userId,
    title: ebook.title,
    author: ebook.author,
    blurb: ebook.blurb,
    publisher: ebook.publisher,
    pub_date: ebook.pubDate,
    isbn: ebook.isbn,
    language: ebook.language,
    genre: ebook.genre,
    tags: ebook.tags,
    cover_image_url: ebook.coverFile,
    endnotes: ebook.endnotes,
    endnote_references: ebook.endnoteReferences,
    updated_at: new Date().toISOString(),
  };

  const { data: ebookData, error: ebookError } = await supabase
    .from("ebooks")
    .upsert([supabaseEbook], { onConflict: "id" })
    .select()
    .single();

  if (ebookError) throw ebookError;

  const chaptersWithEbookId = (chapters ?? []).map((ch, idx) => ({
    id: isUuid(ch.id) ? ch.id : uuidv4(),
    ebook_id: ebookData.id,
    title: ch.title,
    content: ch.content,
    type: ch.type,
    chapter_order: idx,
    updated_at: new Date().toISOString(),
  }));

  if (chaptersWithEbookId.length > 0) {
    const { error: chaptersError } = await supabase
      .from("chapters")
      .upsert(chaptersWithEbookId, { onConflict: "id" });
    if (chaptersError) throw chaptersError;
  }

  const keepIds = chaptersWithEbookId.map((ch) => ch.id);
  const deleteStale = supabase
    .from("chapters")
    .delete()
    .eq("ebook_id", ebookData.id);
  const { error: staleError } =
    keepIds.length > 0
      ? await deleteStale.not("id", "in", `(${keepIds.join(",")})`)
      : await deleteStale;
  if (staleError) throw staleError;

  return ebookData;
}

export async function fetchEbooksFromSupabase(userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase client not initialized");
  const { data, error } = await supabase
    .from("ebooks")
    .select("*, chapters(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .order("chapter_order", { referencedTable: "chapters", ascending: true });
  if (error) throw error;
  return data;
}

export async function deleteEbookFromSupabase(
  ebookId: string,
  userId?: string,
  bookTitle?: string,
) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  let targetEbookId = ebookId;

  if (!isUuid(ebookId)) {
    if (!userId || !bookTitle) {
      return true;
    }
    const { data: foundBooks } = await supabase
      .from("ebooks")
      .select("id")
      .eq("user_id", userId)
      .eq("title", bookTitle)
      .limit(1);

    if (!foundBooks || foundBooks.length === 0) {
      return true;
    }
    targetEbookId = foundBooks[0].id;
  }

  const { error: chaptersError } = await supabase
    .from("chapters")
    .delete()
    .eq("ebook_id", targetEbookId);

  if (chaptersError) {
    console.error("Error deleting chapters:", chaptersError);
  }

  const { error: ebookError } = await supabase
    .from("ebooks")
    .delete()
    .eq("id", targetEbookId);

  if (ebookError) {
    console.error("Error deleting ebook:", ebookError);
    throw ebookError;
  }

  return true;
}
