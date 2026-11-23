import { promises as fs } from 'fs';
import { PDFField, PDFData } from '../types.js';
import { validateFields } from './validateFields.js';

export { validateFields, validateFieldValues, validateFieldCoordinates } from './validateFields.js';

/**
 * Validates that the template PDF file exists
 */
export async function validateTemplatePath(templatePath: string): Promise<void> {
  try {
    await fs.access(templatePath);
  } catch (error) {
    throw new Error(`Template PDF not found: ${templatePath}`);
  }
}

/**
 * Validates all input parameters
 */
export async function validateInput(
  templatePath: string,
  fields: PDFField[],
  data: PDFData
): Promise<void> {
  await validateTemplatePath(templatePath);
  validateFields(fields, data);
}

