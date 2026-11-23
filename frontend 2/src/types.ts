/**
 * Type definitions for the PDF template engine
 */

/**
 * Field definition for text placement on PDF.
 *
 * Coordinates use a TOP-LEFT origin, in PDF points (1 point = 1/72 inch),
 * measured on the page as it is displayed (i.e. after CropBox and /Rotate
 * are applied) — exactly what @jyothiswarup/pdf-template-builder exports.
 */
export interface PDFField {
  /** Unique key to identify the field */
  key: string;
  /** Distance in points from the LEFT edge of the page to the left edge of the field box */
  x: number;
  /** Distance in points from the TOP edge of the page to the top edge of the field box */
  y: number;
  /** Width of the field box in points (optional) */
  width?: number;
  /**
   * Height of the field box in points (optional).
   * When provided, text is vertically centered inside the box;
   * otherwise the top of the text is aligned with `y`.
   */
  height?: number;
  /** Font size in points (optional, defaults to 12) */
  fontSize?: number;
  /** Page number (1-indexed, optional, defaults to 1) */
  page?: number;
}

/**
 * Data object mapping field keys to their values
 */
export interface PDFData {
  [key: string]: string | number | null | undefined;
}

/**
 * Options for generating PDF
 */
export interface GeneratePDFOptions {
  /** Path to the template PDF file */
  templatePath: string;
  /** Path where the output PDF will be saved */
  outputPath: string;
  /** Array of field definitions */
  fields: PDFField[];
  /** Data object with key-value pairs for field values */
  data: PDFData;
}

/**
 * A PDF in memory: Uint8Array, ArrayBuffer or a Node.js Buffer
 */
export type PDFInput = Uint8Array | ArrayBuffer;
