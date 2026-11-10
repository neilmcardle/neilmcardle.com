import snapshot from "./snapshot.json";
import { STORIES, type StartBand } from "./stories";

export type Company = {
  rank: number;
  name: string;
  symbol: string;
  country: string;
  marketCapBn: number;
  sector?: string;
  founded?: number;
  startBand?: StartBand;
  startCost?: string;
  story?: string;
};

const bySymbol = new Map(STORIES.map((s) => [s.symbol, s]));

export const AS_OF = snapshot.asOf;
export const SOURCE = snapshot.source;

export const COMPANIES: Company[] = snapshot.companies.map((row) => {
  const story = bySymbol.get(row.symbol);
  return story
    ? {
        ...row,
        name: story.name,
        country: story.country,
        sector: story.sector,
        founded: story.founded,
        startBand: story.startBand,
        startCost: story.startCost,
        story: story.story,
      }
    : row;
});
