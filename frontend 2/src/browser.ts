/**
 * Browser / serverless / edge entry point — no Node.js built-ins.
 * Bundlers pick this automatically via the "browser" export condition.
 */
export { fillPdf } from './core/fillPdf.js';
export type { PDFField, PDFData, PDFInput } from './types.js';
