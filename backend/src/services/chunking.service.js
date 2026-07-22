import { chunkText } from "../utils/chunkText.js";
import { env } from "../config/env.js";

/**
 * Turns { pageNumber, text }[] (raw per-page extraction) into
 * chunk records ready for embedding + storage.
 */
export const chunkingService = {
  chunkPages(pages) {
    const allChunks = [];
    let globalIndex = 0;

    for (const page of pages) {
      const pieces = chunkText(page.text, { chunkSize: env.chunkSize, overlap: env.chunkOverlap });
      for (const text of pieces) {
        allChunks.push({ pageNumber: page.pageNumber, chunkIndex: globalIndex++, text });
      }
    }
    return allChunks;
  },
};
