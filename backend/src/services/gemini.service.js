import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { ApiError } from "../utils/apiResponse.js";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

/**
 * Thin wrapper around the Gemini SDK. Isolating this here means every
 * caller (embedding.service, rag.service, summary.service) goes through
 * one retry/error-handling policy, and swapping providers later
 * (e.g. to a self-hosted embedding model) touches one file, not five.
 */
export const geminiService = {
  async embedText(text) {
    try {
      const model = genAI.getGenerativeModel({ model: env.geminiEmbedModel });
      const result = await model.embedContent(text);
      return result.embedding.values; // 768-dim vector
    } catch (err) {
      logger.error("Gemini embedding call failed", err);
      throw new ApiError(502, "Failed to generate embeddings for the document");
    }
  },

  /**
   * Batches embedding calls with a small concurrency cap. Gemini's
   * embedding endpoint doesn't offer a native batch API for this SDK
   * version, so we throttle client-side to avoid tripping rate limits
   * on large PDFs (a 100-page doc can produce 300+ chunks).
   */
  async embedBatch(texts, concurrency = 5) {
    const results = new Array(texts.length);
    let cursor = 0;

    async function worker() {
      while (cursor < texts.length) {
        const i = cursor++;
        results[i] = await geminiService.embedText(texts[i]);
      }
    }

    await Promise.all(Array.from({ length: concurrency }, worker));
    return results;
  },

  async generateAnswer({ question, contextChunks }) {
    const model = genAI.getGenerativeModel({ model: env.geminiChatModel });

    const context = contextChunks
      .map((c, i) => `[Chunk ${i + 1} | Page ${c.pageNumber}]\n${c.text}`)
      .join("\n\n");

    const prompt = `You are a document assistant. Answer the user's question using ONLY the context below.
Do not use any outside knowledge. If the context does not contain the answer, say exactly:
"The uploaded document does not contain enough information to answer this question."

Context:
${context}

Question: ${question}

Answer concisely and cite which page(s) you used.`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      logger.error("Gemini generation call failed", err);
      throw new ApiError(502, "Failed to generate an answer right now. Please try again.");
    }
  },

  async generateSummary({ pageText, pageNumber }) {
    const model = genAI.getGenerativeModel({ model: env.geminiChatModel });
    const prompt = `Summarize page ${pageNumber} of a document in 2-4 sentences. Be factual, no speculation.\n\nText:\n${pageText}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  },
};
