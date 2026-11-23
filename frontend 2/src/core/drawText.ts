import { PDFDocument, PDFFont, PDFPage, StandardFonts, degrees, rgb } from 'pdf-lib';
import { PDFField, PDFData } from '../types.js';

/**
 * Normalizes a page's /Rotate value to 0, 90, 180 or 270.
 */
function getPageRotation(page: PDFPage): number {
  const angle = page.getRotation().angle || 0;
  return ((Math.round(angle / 90) * 90) % 360 + 360) % 360;
}

/**
 * Converts a point given in "displayed page" coordinates (top-left origin,
 * points, after CropBox + /Rotate are applied — what a PDF viewer shows and
 * what the template builder exports) into PDF user-space coordinates
 * (bottom-left origin, un-rotated), which is what pdf-lib draws with.
 */
function toUserSpace(page: PDFPage, u: number, v: number): { x: number; y: number } {
  const box = page.getCropBox();
  switch (getPageRotation(page)) {
    case 90:
      return { x: box.x + v, y: box.y + u };
    case 180:
      return { x: box.x + box.width - u, y: box.y + v };
    case 270:
      return { x: box.x + box.width - v, y: box.y + box.height - u };
    default:
      return { x: box.x + u, y: box.y + box.height - v };
  }
}

/**
 * Draws text fields on the PDF document.
 *
 * Field `x`/`y` describe the TOP-LEFT corner of the field box (top-left page
 * origin, in points). Text is placed so that it sits inside that box:
 * vertically centered when `height` is given, otherwise top-aligned to `y`.
 *
 * @param pdfDoc The PDF document to modify
 * @param fields Array of field definitions
 * @param data Data object with field values
 */
export async function drawText(
  pdfDoc: PDFDocument,
  fields: PDFField[],
  data: PDFData
): Promise<void> {
  const pages = pdfDoc.getPages();
  const font: PDFFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const field of fields) {
    // Get the page (default to first page if not specified)
    const pageIndex = (field.page ?? 1) - 1;

    if (pageIndex < 0 || pageIndex >= pages.length) {
      throw new Error(
        `Page ${field.page ?? 1} does not exist in the PDF for field '${field.key}'`
      );
    }

    const page = pages[pageIndex];
    const value = data[field.key];

    // Convert value to string (handle null/undefined as empty string)
    const text = value !== null && value !== undefined ? String(value) : '';
    if (text === '') continue;

    // Get font size (default to 12 if not specified)
    const fontSize = field.fontSize ?? 12;

    // pdf-lib draws text from its BASELINE, so work out how far below the
    // top of the field box the baseline must be for the text to sit inside it.
    const ascent = font.heightAtSize(fontSize, { descender: false });
    const textHeight = font.heightAtSize(fontSize);
    const baselineOffset =
      field.height !== undefined && field.height > 0
        ? (field.height - textHeight) / 2 + ascent // vertically centered in the box
        : ascent; // top of the text aligned with the top of the box

    const origin = toUserSpace(page, field.x, field.y + baselineOffset);

    page.drawText(text, {
      x: origin.x,
      y: origin.y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0), // Black text
      // Counter-rotate so the text reads horizontally on rotated pages
      rotate: degrees(getPageRotation(page)),
    });
  }
}
