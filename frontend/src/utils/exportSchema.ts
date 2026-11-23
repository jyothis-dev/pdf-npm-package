import { PDFField } from '../types';
import { PDFPage } from '../types';

/**
 * Exports fields as JSON schema compatible with @your-scope/pdf-template-engine
 * 
 * Coordinate conversion:
 * - Frontend canvas uses top-left origin (Y increases downward) in pixels (scaled by 1.5)
 * - Backend expects Y measured from TOP of page in points (1/72 inch)
 * - Backend will convert: yPosition = pageHeight - field.y (to get bottom-left for pdf-lib)
 * - So we just need to convert pixels to points, keeping top-based coordinates
 */
export function exportSchema(
  fields: PDFField[],
  pages: PDFPage[]
): Array<{
  key: string;
  x: number;
  y: number;
  fontSize?: number;
  page: number;
}> {
  // Calculate conversion factor based on ACTUAL PDF page dimensions
  // This is more accurate than using a fixed scale factor

  return fields.map((field) => {
    // Ensure field.page is a number (handle case where it might be an object)
    let fieldPageNumber: number;
    if (typeof field.page === 'number') {
      fieldPageNumber = field.page;
    } else if (typeof field.page === 'object' && field.page !== null && 'pageNumber' in field.page) {
      fieldPageNumber = (field.page as any).pageNumber;
    } else {
      // Handle non-serializable values (like DOM elements)
      let pageValueStr: string;
      if (field.page === null) {
        pageValueStr = 'null';
      } else if (typeof field.page === 'object') {
        try {
          const obj = field.page as any;
          pageValueStr = obj.constructor?.name ? `[object ${obj.constructor.name}]` : '[object Object]';
        } catch {
          pageValueStr = '[object Object]';
        }
      } else {
        pageValueStr = String(field.page);
      }
      console.error('Invalid field.page value:', field.page, 'for field:', field.key, 'Type:', typeof field.page);
      throw new Error(`Invalid page number for field "${field.key}": ${pageValueStr}. Expected a number, got ${typeof field.page}`);
    }
    
    const page = pages.find((p) => p.pageNumber === fieldPageNumber);
    if (!page) {
      console.error('Available pages:', pages.map(p => p.pageNumber), 'Looking for:', fieldPageNumber);
      throw new Error(`Page ${fieldPageNumber} not found for field "${field.key}". Available pages: ${pages.map(p => p.pageNumber).join(', ')}`);
    }

    // Calculate conversion factor based on actual PDF dimensions
    // Canvas dimensions are in pixels (scaled), PDF dimensions are in points
    // Conversion factor = PDF points / Canvas pixels
    let xConversionFactor: number;
    let yConversionFactor: number;
    
    if (page.pdfWidth && page.pdfHeight) {
      // Use actual PDF dimensions for accurate conversion
      xConversionFactor = page.pdfWidth / page.width;
      yConversionFactor = page.pdfHeight / page.height;
    } else {
      // Fallback to scale factor if PDF dimensions not available
      const SCALE_FACTOR = 1.5;
      xConversionFactor = 1 / SCALE_FACTOR;
      yConversionFactor = 1 / SCALE_FACTOR;
      console.warn('PDF dimensions not available, using fallback conversion factor');
    }

    // Convert X from canvas pixels to PDF points
    const xPoints = field.x * xConversionFactor;

    // Convert Y from canvas pixels to PDF points
    // CRITICAL: Backend expects Y measured from TOP of page in points
    // Backend code: yPosition = pageHeight - field.y
    // This converts top-based Y to bottom-based for pdf-lib
    //
    // So we should send: Y as distance from TOP (not bottom)
    // Just convert pixels to points, keeping top-based coordinate system
    const yPoints = field.y * yConversionFactor;

    // Debug logging for all fields to help diagnose alignment issues
    console.log(`Field "${field.key}" conversion:`, {
      canvasX: field.x,
      canvasY: field.y,
      canvasWidth: page.width,
      canvasHeight: page.height,
      pdfWidth: page.pdfWidth,
      pdfHeight: page.pdfHeight,
      xConversionFactor: xConversionFactor,
      yConversionFactor: yConversionFactor,
      pdfX: Math.round(xPoints),
      pdfY: Math.round(yPoints)
    });

    return {
      key: field.key,
      x: Math.round(xPoints),
      y: Math.round(yPoints),
      fontSize: field.fontSize || 12,
      page: fieldPageNumber + 1, // Convert to 1-indexed
    };
  });
}

/**
 * Downloads JSON schema as a file
 */
export function downloadSchema(fields: PDFField[], pages: PDFPage[]): void {
  const schema = exportSchema(fields, pages);
  const json = JSON.stringify(schema, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pdf-template-schema.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

