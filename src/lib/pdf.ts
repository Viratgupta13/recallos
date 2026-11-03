// Client-side PDF text extraction (pdf.js). Pulls the selectable text out of a
// PDF in the browser so it can feed the same topic-extraction pipeline as pasted
// notes. Image-only / scanned PDFs have no text layer and return little or none
// (OCR is out of scope).
//
// pdf.js emits text as positioned fragments, and a single word is often split
// across fragments. Joining every fragment with a space would break words
// ("Physi cal"), so we only insert a space/newline when the fragment positions
// (x-gap on the line, or a y change) say there is a real one.
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// Minimal shape of a pdf.js positioned text fragment (avoids importing a deep
// internal type path that the package may not export).
interface TextItem {
  str: string;
  width: number;
  height: number;
  transform: number[];
  hasEOL: boolean;
}

export interface PdfExtractResult {
  text: string;
  pages: number;
}

function pageToText(items: TextItem[]): string {
  let out = '';
  let prevEndX: number | null = null;
  let prevY: number | null = null;

  for (const item of items) {
    const str = item.str ?? '';
    if (!str) continue;
    const x = item.transform[4];
    const y = item.transform[5];
    const w = item.width ?? 0;
    const fontH = item.height || 8;

    if (prevY !== null && prevY - y > fontH * 1.6) {
      // Large vertical gap: a paragraph break.
      out += '\n\n';
    } else if (prevY !== null && Math.abs(y - prevY) > fontH * 0.5) {
      // Ordinary wrapped line: reflow into one paragraph with a space, so a
      // word wrapped across lines stays readable instead of being newline-split.
      if (out && !out.endsWith(' ') && !out.endsWith('\n')) out += ' ';
    } else if (prevEndX !== null && x - prevEndX > fontH * 0.25) {
      // Same line: a space only when there is a real horizontal gap. Fragments
      // continuing a word sit right next to each other (gap ~ 0).
      out += ' ';
    }

    out += str;
    prevEndX = x + w;
    prevY = y;
  }
  return out;
}

export async function extractPdfText(file: File): Promise<PdfExtractResult> {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const parts: string[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const items = (content.items as unknown as TextItem[]).filter((it) => typeof it.str === 'string');
    parts.push(pageToText(items));
  }

  const text = parts
    .join('\n')
    .replace(/-\n(\w)/g, '$1') // join words hyphenated across a line break
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { text, pages: pdf.numPages };
}
