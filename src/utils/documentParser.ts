// ============================================================================
// IRONFORGE - Client-Side Document Parser
// Extracts raw text client-side from PDF (.pdf) using pdfjs-dist
// and Microsoft Word (.docx) documents using mammoth.
// Enforces 10MB file size limit and file type verification.
// ============================================================================

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker in Vite browser environment
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface DocumentParseResult {
  text: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'docx';
}

/**
 * Validates and extracts all readable text from a PDF or Word (.docx) file.
 */
export async function extractTextFromDocument(file: File): Promise<DocumentParseResult> {
  if (!file) {
    throw new Error('No file provided.');
  }

  // 1. File size validation
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large (${sizeInMb}MB). Maximum allowed size is 10MB.`);
  }

  const name = file.name.toLowerCase();
  const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
  const isDocx =
    name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (!isPdf && !isDocx) {
    throw new Error(
      'Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).'
    );
  }

  const arrayBuffer = await file.arrayBuffer();

  // 2. Extract PDF text with pdfjs-dist
  if (isPdf) {
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      const pageTexts: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageStr = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        if (pageStr.trim()) {
          pageTexts.push(`--- Page ${pageNum} ---\n${pageStr}`);
        }
      }

      const extracted = pageTexts.join('\n\n').trim();
      if (!extracted) {
        throw new Error(
          'Could not extract text from this PDF. It may contain scanned images or be password-protected.'
        );
      }

      return {
        text: extracted,
        fileName: file.name,
        fileSize: file.size,
        fileType: 'pdf',
      };
    } catch (err: any) {
      console.error('PDF extraction failed:', err);
      throw new Error(err.message || 'Failed to read PDF document text.');
    }
  }

  // 3. Extract Word text with mammoth
  if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      const extracted = (result.value || '').trim();

      if (!extracted) {
        throw new Error(
          'Could not extract text from this Word file. The document appears to be empty.'
        );
      }

      return {
        text: extracted,
        fileName: file.name,
        fileSize: file.size,
        fileType: 'docx',
      };
    } catch (err: any) {
      console.error('DOCX extraction failed:', err);
      throw new Error(err.message || 'Failed to read Word document text.');
    }
  }

  throw new Error('Unsupported document format.');
}
