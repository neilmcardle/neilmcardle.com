
import { getSupabaseBrowserClient } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Save ebook and chapters to Supabase
export async function saveEbookToSupabase(ebook: any, chapters: any[], userId: string) {
	const supabase = getSupabaseBrowserClient();

	// Upsert ebook
	const { data: ebookData, error: ebookError } = await supabase
		.from('ebooks')
		.upsert([
			{
				...ebook,
				user_id: userId,
				id: ebook.id || uuidv4(),
				updated_at: new Date().toISOString(),
			},
		], { onConflict: ['id'] })
		.select()
		.single();

	if (ebookError) throw ebookError;

	// Upsert chapters
	if (chapters && chapters.length > 0) {
		// Attach ebook_id to each chapter
		const chaptersWithEbookId = chapters.map((ch, idx) => ({
			...ch,
			ebook_id: ebookData.id,
			chapter_order: idx,
			id: ch.id || uuidv4(),
			updated_at: new Date().toISOString(),
		}));
		const { error: chaptersError } = await supabase
			.from('chapters')
			.upsert(chaptersWithEbookId, { onConflict: ['id'] });
		if (chaptersError) throw chaptersError;
	}

	return ebookData;
}

// Fetch all ebooks for a user (with chapters)
export async function fetchEbooksFromSupabase(userId: string) {
	const supabase = getSupabaseBrowserClient();
	const { data, error } = await supabase
		.from('ebooks')
		.select('*, chapters(*)')
		.eq('user_id', userId)
		.order('updated_at', { ascending: false });
	if (error) throw error;
	return data;
}
