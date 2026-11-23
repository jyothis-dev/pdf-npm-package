// Export all components
export { PDFViewer } from './components/PDFViewer.js';
export { FieldMapper } from './components/FieldMapper.js';
export { PDFUploader } from './components/PDFUploader.js';
export { Toolbar } from './components/Toolbar.js';

// Export hooks
export { usePDF } from './hooks/usePDF.js';

// Export utilities
export { exportSchema, downloadSchema } from './utils/exportSchema.js';

// Export types
export type {
  PDFField,
  PDFPage,
  FieldData,
  SchemaField,
} from './types.js';

// Export main component (composite)
export { PDFTemplateBuilder } from './components/PDFTemplateBuilder.js';
export type { PDFTemplateBuilderProps } from './components/PDFTemplateBuilder.js';

