import { PDFField, PDFData } from '../types.js';

/**
 * Validates that all required field values are provided
 */
export function validateFieldValues(fields: PDFField[], data: PDFData): void {
  const missingFields: string[] = [];

  for (const field of fields) {
    if (!(field.key in data) || data[field.key] === null || data[field.key] === undefined) {
      missingFields.push(field.key);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required field values: ${missingFields.join(', ')}`
    );
  }
}

/**
 * Validates field coordinates and page numbers
 */
export function validateFieldCoordinates(fields: PDFField[]): void {
  for (const field of fields) {
    if (typeof field.x !== 'number' || field.x < 0) {
      throw new Error(`Invalid x coordinate for field '${field.key}': ${field.x}`);
    }

    if (typeof field.y !== 'number' || field.y < 0) {
      throw new Error(`Invalid y coordinate for field '${field.key}': ${field.y}`);
    }

    if (field.page !== undefined && (typeof field.page !== 'number' || field.page < 1)) {
      throw new Error(`Invalid page number for field '${field.key}': ${field.page}`);
    }

    for (const dim of ['width', 'height'] as const) {
      const v = field[dim];
      if (v !== undefined && (typeof v !== 'number' || v < 0)) {
        throw new Error(`Invalid ${dim} for field '${field.key}': ${v}`);
      }
    }

    if (field.fontSize !== undefined && (typeof field.fontSize !== 'number' || field.fontSize <= 0)) {
      throw new Error(`Invalid fontSize for field '${field.key}': ${field.fontSize}`);
    }
  }
}

/**
 * Validates field definitions and their values (no file-system access)
 */
export function validateFields(fields: PDFField[], data: PDFData): void {
  if (!Array.isArray(fields)) {
    throw new Error('`fields` must be an array of field definitions');
  }
  validateFieldCoordinates(fields);
  validateFieldValues(fields, data ?? {});
}
