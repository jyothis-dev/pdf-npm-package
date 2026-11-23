import { loadPdf } from './core/loadPdf.js';
import { drawText } from './core/drawText.js';
import { savePdf } from './core/savePdf.js';
import { validateInput } from './core/validateInput.js';
import { GeneratePDFOptions } from './types.js';

/**
 * Generates a PDF by filling text fields on a template PDF
 * 
 * @param options Configuration object containing:
 *   - templatePath: Path to the template PDF file
 *   - outputPath: Path where the generated PDF will be saved
 *   - fields: Array of field definitions with coordinates and styling
 *   - data: Object mapping field keys to their values
 * 
 * @throws Error if template PDF is not found, required fields are missing,
 *         or coordinates are invalid
 * 
 * @example
 * ```typescript
 * await generatePDF({
 *   templatePath: './templates/invoice.pdf',
 *   outputPath: './output/invoice-filled.pdf',
 *   fields: [
 *     { key: 'customerName', x: 100, y: 700, fontSize: 14 },
 *     { key: 'invoiceNumber', x: 100, y: 650, fontSize: 12 }
 *   ],
 *   data: {
 *     customerName: 'John Doe',
 *     invoiceNumber: 'INV-2024-001'
 *   }
 * });
 * ```
 */
export async function generatePDF(options: GeneratePDFOptions): Promise<void> {
  const { templatePath, outputPath, fields, data } = options;

  // Validate all inputs
  await validateInput(templatePath, fields, data);

  // Load the template PDF
  const pdfDoc = await loadPdf(templatePath);

  // Draw text fields on the PDF
  await drawText(pdfDoc, fields, data);

  // Save the modified PDF
  await savePdf(pdfDoc, outputPath);
}

// In-memory API (works in browsers, serverless and Node.js)
export { fillPdf } from './core/fillPdf.js';

// Export types for consumers
export type { PDFField, PDFData, PDFInput, GeneratePDFOptions } from './types.js';

