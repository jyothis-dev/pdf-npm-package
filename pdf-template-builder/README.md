# @jyothiswarup/pdf-template-builder

A React component library for visually mapping PDF template fields. Works seamlessly with [`@jyothiswarup/pdf-template-engine`](https://www.npmjs.com/package/@jyothiswarup/pdf-template-engine) to create a complete PDF template solution.

## 📦 Installation

```bash
npm install @jyothiswarup/pdf-template-builder
```

## ✨ Features

- 🎨 **Visual Field Mapping** - Click on PDF to add fields, drag to reposition
- 📄 **Multi-page Support** - Map fields across multiple PDF pages
- 🎯 **Precise Positioning** - Accurate coordinate mapping with automatic conversion
- 🔧 **Field Customization** - Adjust font sizes, rename fields, set sample data
- 📤 **Schema Export** - Export field definitions as JSON compatible with backend package
- 🚀 **PDF Generation** - Generate filled PDFs directly from the UI
- 💪 **TypeScript Support** - Full TypeScript definitions included
- 🎨 **Customizable** - Use individual components or the all-in-one builder

## 🚀 Quick Start

### Basic Usage

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';

function App() {
  return (
    <PDFTemplateBuilder
      apiEndpoint="http://localhost:3000/pdf"
    />
  );
}
```

### With Custom Handlers

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';

function App() {
  const handleSchemaExport = (schema) => {
    // Save schema to your database
    fetch('/api/templates', {
      method: 'POST',
      body: JSON.stringify({ schema }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const handleGenerate = async (schema, data, pdfFile) => {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('schema', JSON.stringify(schema));
    formData.append('data', JSON.stringify(data));

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      body: formData,
    });

    const blob = await response.blob();
    // Handle the generated PDF
  };

  return (
    <PDFTemplateBuilder
      onSchemaExport={handleSchemaExport}
      onGenerate={handleGenerate}
    />
  );
}
```

## 📚 API Reference

### Components

#### `PDFTemplateBuilder`

Main all-in-one component that combines all functionality.

**Props:**

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `pdfFile` | `File \| null` | `null` | No | Initial PDF file to load |
| `initialSchema` | `FieldSchema[]` | `undefined` | No | Initial field schema (for editing existing templates) |
| `onSchemaChange` | `(schema: FieldSchema[]) => void` | `undefined` | No | Called whenever schema changes (for auto-save) |
| `onSchemaExport` | `(schema: FieldSchema[]) => void` | `undefined` | No | Called when "Export Schema" button is clicked |
| `onGenerate` | `(schema, data, file) => Promise<void>` | `undefined` | No | Custom PDF generation handler |
| `apiEndpoint` | `string` | `undefined` | No | API endpoint URL for PDF generation (alternative to `onGenerate`) |
| `mode` | `'builder' \| 'viewer'` | `'builder'` | No | `'builder'` for field mapping, `'viewer'` for read-only |
| `className` | `string` | `''` | No | Custom CSS class name |

**Example:**

```tsx
<PDFTemplateBuilder
  apiEndpoint="http://localhost:3000/pdf"
  onSchemaExport={(schema) => console.log('Schema:', schema)}
  mode="builder"
/>
```

#### `PDFUploader`

Component for uploading PDF files.

**Props:**

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `onFileSelect` | `(file: File) => void` | - | Yes | Callback when PDF file is selected |
| `loading` | `boolean` | `false` | No | Show loading state |

**Example:**

```tsx
import { PDFUploader } from '@jyothiswarup/pdf-template-builder';

function MyComponent() {
  const handleFileSelect = (file: File) => {
    console.log('Selected PDF:', file.name);
    // Process the file
  };

  return <PDFUploader onFileSelect={handleFileSelect} loading={false} />;
}
```

#### `PDFViewer`

Component for displaying PDF pages with field overlays.

**Props:**

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `pages` | `PDFPage[]` | - | Yes | Array of PDF pages from `usePDF` hook |
| `fields` | `PDFField[]` | - | Yes | Array of field definitions |
| `selectedFieldId` | `string \| null` | - | Yes | ID of currently selected field |
| `onFieldSelect` | `(fieldId: string \| null) => void` | - | Yes | Called when field is selected |
| `onFieldUpdate` | `(fieldId: string, updates: Partial<PDFField>) => void` | - | Yes | Called when field is updated (drag/resize) |
| `onFieldDelete` | `(fieldId: string) => void` | - | Yes | Called when field is deleted |
| `onFieldAdd` | `(pageNumber: number, x: number, y: number) => void` | `undefined` | No | Called when clicking on PDF to add field |
| `getCanvasRef` | `(pageNumber: number) => (element: HTMLCanvasElement \| null) => void` | - | Yes | Function to get canvas ref (from `usePDF` hook) |

**Example:**

```tsx
import { PDFViewer, usePDF } from '@jyothiswarup/pdf-template-builder';

function MyComponent() {
  const { pages, loadPDF, getCanvasRef } = usePDF();
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);

  return (
    <PDFViewer
      pages={pages}
      fields={fields}
      selectedFieldId={selectedFieldId}
      onFieldSelect={setSelectedFieldId}
      onFieldUpdate={(id, updates) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
      }}
      onFieldDelete={(id) => {
        setFields(prev => prev.filter(f => f.id !== id));
      }}
      onFieldAdd={(page, x, y) => {
        // Add new field
      }}
      getCanvasRef={getCanvasRef}
    />
  );
}
```

#### `FieldMapper`

Component for managing and editing fields.

**Props:**

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `fields` | `PDFField[]` | - | Yes | Array of field definitions |
| `selectedFieldId` | `string \| null` | - | Yes | ID of currently selected field |
| `onFieldAdd` | `() => void` | - | Yes | Called when "Add Field" button is clicked |
| `onFieldUpdate` | `(fieldId: string, updates: Partial<PDFField>) => void` | - | Yes | Called when field properties are updated |
| `onFieldDelete` | `(fieldId: string) => void` | - | Yes | Called when field is deleted |
| `onFieldSelect` | `(fieldId: string \| null) => void` | - | Yes | Called when field is selected |
| `currentPage` | `number` | - | Yes | Currently selected page (0-indexed) |
| `onPageChange` | `(page: number) => void` | - | Yes | Called when page selection changes |
| `pages` | `Array<{ pageNumber: number }>` | - | Yes | Array of available pages |
| `fieldData` | `FieldData` | - | Yes | Sample data for fields |
| `onFieldDataChange` | `(key: string, value: string) => void` | - | Yes | Called when field sample data changes |

**Example:**

```tsx
import { FieldMapper } from '@jyothiswarup/pdf-template-builder';

<FieldMapper
  fields={fields}
  selectedFieldId={selectedFieldId}
  onFieldAdd={() => addNewField()}
  onFieldUpdate={(id, updates) => updateField(id, updates)}
  onFieldDelete={(id) => deleteField(id)}
  onFieldSelect={setSelectedFieldId}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  pages={pages}
  fieldData={fieldData}
  onFieldDataChange={(key, value) => updateFieldData(key, value)}
/>
```

#### `Toolbar`

Component with export and generate buttons.

**Props:**

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `fields` | `PDFField[]` | - | Yes | Array of field definitions |
| `pages` | `PDFPage[]` | - | Yes | Array of PDF pages |
| `fieldData` | `FieldData` | - | Yes | Sample data for fields |
| `pdfFile` | `File \| null` | - | Yes | Current PDF file |
| `onGeneratePDF` | `(schema, data, file) => Promise<void>` | - | Yes | Called when "Generate PDF" is clicked |
| `generating` | `boolean` | `false` | No | Show generating state |
| `onSchemaExport` | `(schema: FieldSchema[]) => void` | `undefined` | No | Called when "Export Schema" is clicked |

**Example:**

```tsx
import { Toolbar, exportSchema } from '@jyothiswarup/pdf-template-builder';

<Toolbar
  fields={fields}
  pages={pages}
  fieldData={fieldData}
  pdfFile={pdfFile}
  onGeneratePDF={async (schema, data, file) => {
    // Generate PDF
  }}
  generating={false}
  onSchemaExport={(schema) => {
    // Export schema
  }}
/>
```

### Hooks

#### `usePDF()`

Hook for loading and managing PDF files.

**Returns:**

```typescript
{
  pdfDoc: any;                    // PDF.js document object
  pages: PDFPage[];               // Array of rendered PDF pages
  loading: boolean;               // Loading state
  error: string | null;            // Error message if any
  loadPDF: (file: File) => Promise<void>;  // Function to load PDF
  getCanvasRef: (pageNumber: number) => (element: HTMLCanvasElement | null) => void;  // Get canvas ref
}
```

**Example:**

```tsx
import { usePDF } from '@jyothiswarup/pdf-template-builder';

function MyComponent() {
  const { pages, loading, error, loadPDF, getCanvasRef } = usePDF();

  const handleFileSelect = async (file: File) => {
    await loadPDF(file);
  };

  if (loading) return <div>Loading PDF...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {pages.map(page => (
        <div key={page.pageNumber}>
          {/* Render page */}
        </div>
      ))}
    </div>
  );
}
```

### Utilities

#### `exportSchema(fields: PDFField[], pages: PDFPage[]): FieldSchema[]`

Converts internal field format to schema format compatible with `@jyothiswarup/pdf-template-engine`.

**Parameters:**
- `fields`: Array of `PDFField` objects
- `pages`: Array of `PDFPage` objects from `usePDF` hook

**Returns:** Array of field schema objects

**Example:**

```tsx
import { exportSchema } from '@jyothiswarup/pdf-template-builder';

const schema = exportSchema(fields, pages);
// [
//   {
//     key: 'customerName',
//     x: 100,
//     y: 700,
//     fontSize: 14,
//     page: 1
//   }
// ]
```

#### `downloadSchema(fields: PDFField[], pages: PDFPage[]): void`

Exports schema and triggers browser download as JSON file.

**Parameters:**
- `fields`: Array of `PDFField` objects
- `pages`: Array of `PDFPage` objects

**Example:**

```tsx
import { downloadSchema } from '@jyothiswarup/pdf-template-builder';

downloadSchema(fields, pages);
// Downloads 'pdf-template-schema.json'
```

### Types

#### `PDFField`

Internal field representation used by components.

```typescript
interface PDFField {
  id: string;           // Unique identifier
  key: string;         // Field key (used in data mapping)
  x: number;           // X coordinate in pixels (canvas)
  y: number;           // Y coordinate in pixels (canvas)
  width: number;       // Field width in pixels
  height: number;      // Field height in pixels
  page: number;        // Page number (0-indexed)
  fontSize?: number;   // Font size in points (default: 12)
}
```

#### `PDFPage`

PDF page representation from `usePDF` hook.

```typescript
interface PDFPage {
  pageNumber: number;        // Page number (0-indexed)
  canvas: HTMLCanvasElement; // Canvas element with rendered PDF
  width: number;            // Canvas width in pixels (scaled)
  height: number;           // Canvas height in pixels (scaled)
  pdfWidth?: number;        // Actual PDF width in points
  pdfHeight?: number;       // Actual PDF height in points
}
```

#### `FieldData`

Sample data for fields.

```typescript
interface FieldData {
  [key: string]: string | number;  // Key-value pairs matching field keys
}
```

#### `FieldSchema`

Schema format compatible with backend package (exported format).

```typescript
interface FieldSchema {
  key: string;         // Field key
  x: number;          // X coordinate in points (PDF coordinates)
  y: number;          // Y coordinate in points (from top of page)
  fontSize?: number;  // Font size in points
  page: number;       // Page number (1-indexed)
}
```

## 📖 Usage Examples

### Example 1: Simple Template Builder

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';

function TemplateBuilder() {
  return (
    <PDFTemplateBuilder
      apiEndpoint="http://localhost:3000/pdf"
    />
  );
}
```

### Example 2: Save Schema to Database

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';

function TemplateBuilder() {
  const handleSchemaExport = async (schema) => {
    await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invoice Template',
        schema: schema
      })
    });
    alert('Template saved!');
  };

  return (
    <PDFTemplateBuilder
      onSchemaExport={handleSchemaExport}
    />
  );
}
```

### Example 3: Load and Edit Existing Template

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';
import { useState, useEffect } from 'react';

function EditTemplate({ templateId }) {
  const [template, setTemplate] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    fetch(`/api/templates/${templateId}`)
      .then(res => res.json())
      .then(data => {
        setTemplate(data);
        // Load PDF file if you have URL
        fetch(data.pdfUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'template.pdf', { type: 'application/pdf' });
            setPdfFile(file);
          });
      });
  }, [templateId]);

  if (!template || !pdfFile) return <div>Loading...</div>;

  return (
    <PDFTemplateBuilder
      pdfFile={pdfFile}
      initialSchema={template.schema}
      onSchemaChange={(schema) => {
        // Auto-save on change
        fetch(`/api/templates/${templateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schema })
        });
      }}
    />
  );
}
```

### Example 4: Custom Layout with Individual Components

```tsx
import { 
  PDFUploader, 
  PDFViewer, 
  FieldMapper, 
  Toolbar,
  usePDF,
  exportSchema
} from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';
import { useState } from 'react';

function CustomBuilder() {
  const { pages, loading, error, loadPDF, getCanvasRef } = usePDF();
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [fieldData, setFieldData] = useState({});
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileSelect = (file: File) => {
    setPdfFile(file);
    loadPDF(file);
  };

  const handleFieldAdd = () => {
    const newField = {
      id: `field-${Date.now()}`,
      key: `field${fields.length + 1}`,
      x: 50,
      y: 50,
      width: 200,
      height: 30,
      page: currentPage,
      fontSize: 12,
    };
    setFields([...fields, newField]);
  };

  const handleGenerate = async () => {
    const schema = exportSchema(fields, pages);
    // Generate PDF...
  };

  return (
    <div className="custom-builder">
      <div className="sidebar">
        <PDFUploader onFileSelect={handleFileSelect} loading={loading} />
        {error && <div className="error">{error}</div>}
        
        {pages.length > 0 && (
          <>
            <FieldMapper
              fields={fields}
              selectedFieldId={selectedFieldId}
              onFieldAdd={handleFieldAdd}
              onFieldUpdate={(id, updates) => {
                setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
              }}
              onFieldDelete={(id) => {
                setFields(fields.filter(f => f.id !== id));
              }}
              onFieldSelect={setSelectedFieldId}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              pages={pages}
              fieldData={fieldData}
              onFieldDataChange={(key, value) => {
                setFieldData({ ...fieldData, [key]: value });
              }}
            />
            <Toolbar
              fields={fields}
              pages={pages}
              fieldData={fieldData}
              pdfFile={pdfFile}
              onGeneratePDF={handleGenerate}
            />
          </>
        )}
      </div>
      
      <div className="main">
        {pages.length > 0 ? (
          <PDFViewer
            pages={pages}
            fields={fields}
            selectedFieldId={selectedFieldId}
            onFieldSelect={setSelectedFieldId}
            onFieldUpdate={(id, updates) => {
              setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
            }}
            onFieldDelete={(id) => {
              setFields(fields.filter(f => f.id !== id));
            }}
            onFieldAdd={(page, x, y) => {
              const newField = {
                id: `field-${Date.now()}`,
                key: `field${fields.length + 1}`,
                x, y,
                width: 200,
                height: 30,
                page,
                fontSize: 12,
              };
              setFields([...fields, newField]);
            }}
            getCanvasRef={getCanvasRef}
          />
        ) : (
          <div>Upload a PDF to get started</div>
        )}
      </div>
    </div>
  );
}
```

## 🎨 Styling

### Default Styles

Import the default stylesheet:

```tsx
import '@jyothiswarup/pdf-template-builder/styles';
```

### Custom Styling

You can override styles by targeting the component classes:

```css
/* Main container */
.pdf-template-builder {
  /* Your styles */
}

/* PDF viewer area */
.pdf-viewer {
  /* Your styles */
}

.pdf-page-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
}

.canvas-wrapper {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Field boxes */
.field-box {
  border: 2px dashed #007bff;
  background: rgba(0, 123, 255, 0.1);
}

.field-box.selected {
  border-color: #0056b3;
  background: rgba(0, 123, 255, 0.2);
}

/* Field mapper sidebar */
.field-mapper {
  /* Your styles */
}

.field-item {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
}

/* Toolbar */
.toolbar {
  /* Your styles */
}

.toolbar-button {
  padding: 0.75rem 1rem;
  border-radius: 6px;
}
```

## 🔗 Integration with Backend Package

This package is designed to work with [`@jyothiswarup/pdf-template-engine`](https://www.npmjs.com/package/@jyothiswarup/pdf-template-engine):

### Workflow

1. **Admin Setup** (using this package):
   ```tsx
   <PDFTemplateBuilder
     onSchemaExport={(schema) => saveToDatabase(schema)}
   />
   ```

2. **Save Schema** to database:
   ```json
   {
     "templateId": "invoice-v1",
     "schema": [
       { "key": "customerName", "x": 100, "y": 700, "fontSize": 14, "page": 1 }
     ]
   }
   ```

3. **User Data Entry** (your form):
   ```tsx
   <form onSubmit={handleSubmit}>
     <input name="customerName" />
     {/* Other fields */}
   </form>
   ```

4. **Backend Generation** (using backend package):
   ```javascript
   const { generatePDF } = require('@jyothiswarup/pdf-template-engine');
   
   const template = await db.getTemplate('invoice-v1');
   const userData = req.body; // From form
   
   await generatePDF({
     templatePath: template.pdfUrl,
     outputPath: './output.pdf',
     fields: template.schema,
     data: userData
   });
   ```

## 🛠️ Requirements

- **React** >= 18.0.0
- **React DOM** >= 18.0.0
- **PDF.js** (loaded automatically from CDN, no installation needed)

## 📝 Coordinate System

The package handles coordinate conversion automatically:

- **Frontend (Canvas)**: Top-left origin, pixels, scaled by 1.5x
- **Backend (PDF)**: Top-left origin, points (1/72 inch)
- **Conversion**: Automatically handled by `exportSchema` utility

## 🐛 Troubleshooting

### PDF not loading

- Check browser console for PDF.js errors
- Ensure PDF file is valid
- Check CORS if loading from URL

### Fields not appearing

- Verify fields are added to correct page
- Check that `pages` array is populated
- Ensure `getCanvasRef` is properly connected

### Schema export errors

- Ensure all fields have valid `page` numbers
- Check that `pages` array matches field pages
- Verify field coordinates are numbers

### Styling issues

- Make sure you import styles: `import '@jyothiswarup/pdf-template-builder/styles';`
- Check for CSS conflicts
- Verify component classes are not overridden

## 📄 License

MIT

## 🔗 Related Packages

- [`@jyothiswarup/pdf-template-engine`](https://www.npmjs.com/package/@jyothiswarup/pdf-template-engine) - Backend PDF generation engine

## 🤝 Contributing

Contributions welcome! Please open an issue or PR on GitHub.

## 📧 Support

For issues and questions:
- GitHub Issues: [Your repo URL]
- Email: [Your email]

---

Made with ❤️ by Jyothiswarup E V
