const AFFILIATE_ID = process.env.NEXT_PUBLIC_BOOKSHOP_AFFILIATE_ID?.trim();

export function buyLink(isbn13: string | null | undefined): string | null {
  if (!isbn13) return null;
  return AFFILIATE_ID
    ? `https://bookshop.org/a/${AFFILIATE_ID}/${isbn13}`
    : `https://bookshop.org/uk/search?keywords=${encodeURIComponent(isbn13)}`;
}

export const BUY_LINK_LABEL = "Find this book";
