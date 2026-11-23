import { PDFField, PDFPage, SchemaField } from '../types';

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Exports fields as a JSON schema for @jyothiswarup/pdf-template-engine.
 *
 * Fields are stored in PDF points with a top-left origin (see PDFField), which
 * is exactly what the engine expects, so no pixel conversion is needed here.
 * The engine draws text inside the box described by x / y / width / height.
 */
export function exportSchema(fields: PDFField[], pages: PDFPage[]): SchemaField[] {
  return fields.map((field) => {
    const pageNumber = field.page;
    if (typeof pageNumber !== 'number' || Number.isNaN(pageNumber)) {
      throw new Error(
        `Invalid page number for field "${field.key}": expected a number, got ${typeof pageNumber}`
      );
    }

    if (pages.length > 0 && !pages.some((p) => p.pageNumber === pageNumber)) {
      throw new Error(
        `Page ${pageNumber + 1} not found for field "${field.key}". ` +
          `The PDF has ${pages.length} page(s).`
      );
    }

    return {
      key: field.key,
      x: round2(field.x),
      y: round2(field.y),
      width: round2(field.width),
      height: round2(field.height),
      fontSize: field.fontSize || 12,
      page: pageNumber + 1, // engine pages are 1-indexed
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
