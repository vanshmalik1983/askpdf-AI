import fs from "fs/promises";
import pdfParse from "pdf-parse";
import { ApiError } from "../utils/apiResponse.js";

/**
 * Extracts per-page text from a PDF buffer.
 *
 * pdf-parse gives us the full text with form-feed-ish page breaks via
 * its `pagerender` hook, which we use to tag each page's text before
 * it's concatenated — this is what lets citations point to a specific
 * page number later in the pipeline.
 */
export const pdfService = {
  async extractPages(filePath) {
    const buffer = await fs.readFile(filePath);

    const pages = [];
    const options = {
      pagerender: async (pageData) => {
        const textContent = await pageData.getTextContent();
        const text = textContent.items.map((item) => item.str).join(" ");
        pages.push({ pageNumber: pageData.pageIndex + 1, text });
        return text;
      },
    };

    const data = await pdfParse(buffer, options);

    if (!data.text || data.text.trim().length < 20) {
      throw new ApiError(
        422,
        "This PDF appears to be empty or is a scanned image without extractable text. Try an OCR'd version."
      );
    }

    return { pages, totalPages: data.numpages };
  },
};
