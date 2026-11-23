import { PDFDocument } from 'pdf-lib';
import { drawText } from './drawText.js';
import { validateFields } from './validateFields.js';
import { PDFData, PDFField, PDFInput } from '../types.js';

/**
 * Fills a PDF template in memory and returns the new PDF bytes.
 *
 * Has no Node.js / file-system dependencies, so it works in the browser,
 * in serverless / edge functions, and in Node.js alike.
 *
 * @param pdf    The template PDF (Uint8Array, ArrayBuffer or Node Buffer)
 * @param fields Field definitions (e.g. the schema exported by
 *               @jyothiswarup/pdf-template-builder)
 * @param data   Values keyed by field `key`
 * @returns      The filled PDF as a Uint8Array
 *
 * @example
 * ```ts
 * const bytes = await fillPdf(await file.arrayBuffer(), schema, { name: 'Ada' });
 * const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
 * ```
 */
export async function fillPdf(
  pdf: PDFInput,
  fields: PDFField[],
  data: PDFData
): Promise<Uint8Array> {
  validateFields(fields, data);

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(pdf);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to load PDF template: ${message}`);
  }

  await drawText(pdfDoc, fields, data);
  return pdfDoc.save();
}
