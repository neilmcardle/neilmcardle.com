export type NoulQuestion = {
  type: "noul";
  instructions: string;
  criteria: { true: string; false: string };
};

export type ChoiceQuestion = {
  type: "choice";
  instructions: string;

  criteria: Record<string, string>;
};

export type ScoreQuestion = {
  type: "score";
  instructions: string;

  criteria: string[];
};

export type Question = NoulQuestion | ChoiceQuestion | ScoreQuestion;

export type NoulAnswer = { type: "noul"; noul: number };
export type ChoiceAnswer = {
  type: "choice";
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
};
export type ScoreAnswer = {
  type: "score";

  score: number;
  legend?: Record<string, unknown>;
  probabilities?: Record<string, number>;
  confidence?: number;
};
export type Answer = NoulAnswer | ChoiceAnswer | ScoreAnswer;

export type JevRequest = {
  state: unknown;
  questions: Record<string, Question>;
};

export type JevResponse = {
  model: string;
  answers: Record<string, Answer>;
  usage: { input_tokens: number; output_tokens: number };

  ms: number;
};

export const JEV_USD_PER_MILLION_INPUT = 0.042;

export function costUsd(inputTokens: number): number {
  return (inputTokens / 1_000_000) * JEV_USD_PER_MILLION_INPUT;
}
