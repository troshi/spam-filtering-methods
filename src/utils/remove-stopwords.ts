import { stopwords } from "../data/en-stopwords";

export function removeStopwords(tokens: string[]): string[] {
  return tokens.filter(
    token => !stopwords.has(token.toLowerCase())
  );
}
