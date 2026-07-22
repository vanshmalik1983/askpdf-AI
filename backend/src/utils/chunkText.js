/**
 * Splits raw page text into overlapping, sentence-aware chunks.
 *
 * Why sentence-aware instead of a hard character cut:
 * cutting mid-sentence produces embeddings for half-thoughts, which
 * hurts retrieval quality. We accumulate sentences until we hit the
 * target chunk size, then carry the overlap window forward so context
 * isn't lost at chunk boundaries (e.g. an answer that spans two
 * sentences on either side of a cut).
 */
export function chunkText(text, { chunkSize = 800, overlap = 120 } = {}) {
  const sentences = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.?!])\s+/);

  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > chunkSize && current) {
      chunks.push(current.trim());
      // carry the tail of the previous chunk forward as overlap
      const words = current.trim().split(" ");
      const overlapWords = words.slice(Math.max(0, words.length - Math.floor(overlap / 5)));
      current = overlapWords.join(" ") + " " + sentence;
    } else {
      current = (current + " " + sentence).trim();
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.filter((c) => c.length > 20); // drop near-empty fragments (headers, page numbers)
}
