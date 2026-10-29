// Plain-language checks for on-screen text (REVAMP §7). Pure helpers the tests run
// over every copy string: long sentences are where jargon hides.

/** Hard ceiling on words per on-screen sentence (REVAMP §7; aim for under 20). */
export const MAX_SENTENCE_WORDS = 30;

/** Every string leaf in a nested copy object, in key order. */
export function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value !== "object" || value === null) return [];
  return Object.values(value).flatMap(allStrings);
}

/** Split text into sentences at ., ! or ? followed by whitespace. */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Words in a sentence: whitespace-separated tokens. */
export function wordCount(sentence: string): number {
  return sentence.split(/\s+/).filter((w) => w.length > 0).length;
}

/** Sentences across `strings` longer than `max` words (empty when all pass). */
export function longSentences(strings: readonly string[], max = MAX_SENTENCE_WORDS): string[] {
  return strings.flatMap(sentences).filter((s) => wordCount(s) > max);
}
