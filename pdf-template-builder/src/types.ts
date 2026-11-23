/**
 * A field placed on the PDF.
 *
 * All geometry is in PDF POINTS (1/72 inch) with a TOP-LEFT origin, measured
 * on the page as displayed (CropBox and /Rotate applied). This is independent
 * of how large the page happens to be drawn on screen, so fields stay put
 * when the viewer is resized and export 1:1 to the engine.
 */
export interface PDFField {
  id: string;
  key: string;
  /** Left edge of the box, in points from the left of the page */
  x: number;
  /** Top edge of the box, in points from the top of the page */
  y: number;
  /** Box width in points */
  width: number;
  /** Box height in points */
  height: number;
  /** 0-indexed page number */
  page: number;
  /** Font size in points */
  fontSize?: number;
}

export interface PDFPage {
  /** 0-indexed page number */
  pageNumber: number;
  canvas: HTMLCanvasElement;
  /** Canvas width in pixels (rendered at RENDER_SCALE) */
  width: number;
  /** Canvas height in pixels (rendered at RENDER_SCALE) */
  height: number;
  /** Page width in PDF points (as displayed) */
  pdfWidth?: number;
  /** Page height in PDF points (as displayed) */
  pdfHeight?: number;
}

export interface FieldData {
  [key: string]: string | number;
}

/**
 * Field definition exported for @jyothiswarup/pdf-template-engine.
 * x / y / width / height are in PDF points, top-left origin; page is 1-indexed.
 */
export interface SchemaField {
  key: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  page: number;
}
