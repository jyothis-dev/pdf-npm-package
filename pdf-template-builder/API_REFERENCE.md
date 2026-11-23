# API Reference - Quick Guide

## Exports

```typescript
// Main component
export { PDFTemplateBuilder }
export type { PDFTemplateBuilderProps }

// Individual components
export { PDFViewer }
export { FieldMapper }
export { PDFUploader }
export { Toolbar }

// Hooks
export { usePDF }

// Utilities
export { exportSchema, downloadSchema }

// Types
export type { PDFField, PDFPage, FieldData }
```

## Component Props Quick Reference

### PDFTemplateBuilder

```typescript
interface PDFTemplateBuilderProps {
  pdfFile?: File | null;
  initialSchema?: FieldSchema[];
  onSchemaChange?: (schema: FieldSchema[]) => void;
  onSchemaExport?: (schema: FieldSchema[]) => void;
  onGenerate?: (schema: FieldSchema[], data: FieldData, file: File) => Promise<void>;
  apiEndpoint?: string;
  mode?: 'builder' | 'viewer';
  className?: string;
}
```

### PDFViewer

```typescript
interface PDFViewerProps {
  pages: PDFPage[];
  fields: PDFField[];
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<PDFField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldAdd?: (pageNumber: number, x: number, y: number) => void;
  getCanvasRef: (pageNumber: number) => (element: HTMLCanvasElement | null) => void;
}
```

### FieldMapper

```typescript
interface FieldMapperProps {
  fields: PDFField[];
  selectedFieldId: string | null;
  onFieldAdd: () => void;
  onFieldUpdate: (fieldId: string, updates: Partial<PDFField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldSelect: (fieldId: string | null) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  pages: Array<{ pageNumber: number }>;
  fieldData: FieldData;
  onFieldDataChange: (key: string, value: string) => void;
}
```

### PDFUploader

```typescript
interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
}
```

### Toolbar

```typescript
interface ToolbarProps {
  fields: PDFField[];
  pages: PDFPage[];
  fieldData: FieldData;
  pdfFile: File | null;
  onGeneratePDF: (schema: FieldSchema[], data: FieldData, pdfFile: File) => Promise<void>;
  generating?: boolean;
  onSchemaExport?: (schema: FieldSchema[]) => void;
}
```

## Type Definitions

### PDFField

```typescript
interface PDFField {
  id: string;
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;        // 0-indexed
  fontSize?: number;
}
```

### PDFPage

```typescript
interface PDFPage {
  pageNumber: number;        // 0-indexed
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  pdfWidth?: number;
  pdfHeight?: number;
}
```

### FieldData

```typescript
interface FieldData {
  [key: string]: string | number;
}
```

### FieldSchema (Export Format)

```typescript
interface FieldSchema {
  key: string;
  x: number;          // Points (PDF coordinates)
  y: number;          // Points (from top)
  fontSize?: number;  // Points
  page: number;       // 1-indexed
}
```

## Hook Returns

### usePDF()

```typescript
{
  pdfDoc: any;
  pages: PDFPage[];
  loading: boolean;
  error: string | null;
  loadPDF: (file: File) => Promise<void>;
  getCanvasRef: (pageNumber: number) => (element: HTMLCanvasElement | null) => void;
}
```

## Utility Functions

### exportSchema()

```typescript
exportSchema(fields: PDFField[], pages: PDFPage[]): FieldSchema[]
```

Converts internal field format to backend-compatible schema.

### downloadSchema()

```typescript
downloadSchema(fields: PDFField[], pages: PDFPage[]): void
```

Exports schema and triggers browser download.

