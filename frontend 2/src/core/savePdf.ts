import { promises as fs } from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

/**
 * Saves a PDF document to disk, creating the output directory if needed
 */
export async function savePdf(pdfDoc: PDFDocument, outputPath: string): Promise<void> {
  try {
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to save PDF: ${error.message}`);
    }
    throw new Error('Failed to save PDF: Unknown error');
  }
}
