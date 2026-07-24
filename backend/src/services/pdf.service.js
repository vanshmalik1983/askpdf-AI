import fs from "fs/promises";
import pdfParse from "pdf-parse";
import { ApiError } from "../utils/apiResponse.js";

// PDFs with less than 20 characters of extracted text are treated as invalid.
const MIN_TEXT_LENGTH = 20;

/**
 * PDF text extraction service.
 *
 * Extracts text page-by-page so that downstream features such as
 * chunking, citations, summaries, and question answering can retain
 * accurate page references.
 */
export const pdfService = {
  async extractPages(filePath) {
    const buffer = await fs.readFile(filePath);

    const pages = [];

    const options = {
      pagerender: async (pageData) => {
        const textContent = await pageData.getTextContent();

        const text = textContent.items
          .map((item) => item.str)
          .join(" ")
          .trim();

        pages.push({
          pageNumber: pageData.pageIndex + 1,
          text,
        });

        return text;
      },
    };

    const data = await pdfParse(buffer, options);

    const extractedText = data.text?.trim() ?? "";

    if (extractedText.length < MIN_TEXT_LENGTH) {
      throw new ApiError(
        422,
        "This PDF appears to be empty or is a scanned image without extractable text. Try an OCR'd version."
      );
    }

    return {
      pages,
      totalPages: data.numpages,
    };
  },
};