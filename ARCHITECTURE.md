# PDF Template Engine - Architecture Guide

## Overview

This document explains the recommended architecture for using the PDF Template Engine in production scenarios.

## Package Structure

### 1. Backend Package: `@jyothiswarup/pdf-template-engine`
**Purpose**: Core PDF generation engine (server-side only)

**Usage**:
```javascript
const { generatePDF } = require('@jyothiswarup/pdf-template-engine');

await generatePDF({
  templatePath: './templates/invoice.pdf',
  outputPath: './output/invoice-filled.pdf',
  fields: schema, // Field definitions with coordinates
  data: userData  // User data to fill
});
```

### 2. Frontend Package: `@jyothiswarup/pdf-template-builder` (Recommended)
**Purpose**: React components for visual field mapping

**Usage**:
```jsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';

<PDFTemplateBuilder
  pdfFile={templateFile}
  onSchemaExport={(schema) => saveSchema(schema)}
  onGenerate={(schema, data) => generatePDF(schema, data)}
/>
```

## Production Workflow

### Phase 1: Admin Setup (One-time per template)

1. **Admin uploads PDF template**
2. **Admin maps fields visually** using the frontend builder
3. **Schema is saved** to database/storage:
   ```json
   {
     "templateId": "invoice-template-v1",
     "pdfUrl": "s3://bucket/templates/invoice.pdf",
     "schema": [
       {
         "key": "customerName",
         "x": 100,
         "y": 700,
         "fontSize": 14,
         "page": 1
       },
       {
         "key": "invoiceNumber",
         "x": 100,
         "y": 650,
         "fontSize": 12,
         "page": 1
       }
     ],
     "fieldLabels": {
       "customerName": "Customer Name",
       "invoiceNumber": "Invoice Number"
     }
   }
   ```

### Phase 2: User Data Entry (Repeated)

1. **User fills form** with their data
2. **Form data maps to schema keys**:
   ```javascript
   const userData = {
     customerName: formData.customerName,
     invoiceNumber: formData.invoiceNumber
   };
   ```
3. **Backend generates PDF**:
   ```javascript
   // Get template schema from database
   const template = await db.getTemplate('invoice-template-v1');
   
   // Generate PDF
   await generatePDF({
     templatePath: template.pdfUrl,
     outputPath: outputPath,
     fields: template.schema,
     data: userData
   });
   ```

## Recommended Architecture

### Option A: Two Separate Packages (Recommended)

**Pros**:
- ✅ Clear separation of concerns
- ✅ Backend package is framework-agnostic
- ✅ Frontend package can be used in any React app
- ✅ Independent versioning
- ✅ Users can choose what they need

**Cons**:
- ⚠️ More packages to maintain
- ⚠️ Need to keep them compatible

**Structure**:
```
pdf-template-engine/          (Backend - published)
  ├── src/
  ├── dist/
  └── package.json

pdf-template-builder/         (Frontend - to create)
  ├── src/
  │   ├── components/
  │   │   ├── PDFViewer.tsx
  │   │   ├── FieldMapper.tsx
  │   │   └── PDFUploader.tsx
  │   ├── hooks/
  │   │   └── usePDF.ts
  │   └── index.ts
  ├── dist/
  └── package.json
```

### Option B: Monorepo with Both Packages

**Pros**:
- ✅ Easier to maintain together
- ✅ Can version together
- ✅ Shared types/utilities

**Cons**:
- ⚠️ More complex setup
- ⚠️ Users must install both or nothing

## Implementation Recommendations

### 1. Database Schema

```sql
-- Templates table
CREATE TABLE pdf_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  pdf_url TEXT,
  schema JSONB,
  field_labels JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Generated PDFs table (optional)
CREATE TABLE generated_pdfs (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES pdf_templates(id),
  user_data JSONB,
  pdf_url TEXT,
  created_at TIMESTAMP
);
```

### 2. API Endpoints

```javascript
// Admin endpoints
POST   /api/templates              // Create template
GET    /api/templates              // List templates
GET    /api/templates/:id          // Get template
PUT    /api/templates/:id          // Update template
DELETE /api/templates/:id          // Delete template

// User endpoints
POST   /api/templates/:id/generate  // Generate PDF with user data
GET    /api/pdfs/:id               // Download generated PDF
```

### 3. Frontend Package API

```typescript
// Main component
interface PDFTemplateBuilderProps {
  pdfFile: File | string;           // PDF template
  schema?: FieldSchema[];            // Existing schema (for editing)
  onSchemaChange?: (schema: FieldSchema[]) => void;
  onSchemaExport?: (schema: FieldSchema[]) => void;
  onGenerate?: (schema: FieldSchema[], data: Record<string, any>) => Promise<void>;
  mode?: 'builder' | 'viewer';        // Builder mode or just viewer
}

// Standalone form component
interface PDFFormProps {
  schema: FieldSchema[];
  fieldLabels?: Record<string, string>;
  onSubmit: (data: Record<string, any>) => void;
}
```

## Example Implementation

### Backend API Route

```javascript
// routes/pdf.js
const express = require('express');
const { generatePDF } = require('@jyothiswarup/pdf-template-engine');
const router = express.Router();

// Generate PDF from template
router.post('/templates/:templateId/generate', async (req, res) => {
  const { templateId } = req.params;
  const userData = req.body.data;
  
  // Get template from database
  const template = await db.getTemplate(templateId);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  // Generate unique output path
  const outputPath = `/tmp/generated-${Date.now()}.pdf`;
  
  // Generate PDF
  await generatePDF({
    templatePath: template.pdfUrl,
    outputPath,
    fields: template.schema,
    data: userData
  });
  
  // Send PDF to client
  res.sendFile(outputPath, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=generated.pdf'
    }
  });
  
  // Cleanup
  fs.unlink(outputPath).catch(console.error);
});
```

### Frontend Usage

```jsx
// Admin: Template Builder Page
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';

function AdminTemplateBuilder() {
  const [pdfFile, setPdfFile] = useState(null);
  
  const handleSchemaExport = async (schema) => {
    // Save to database
    await fetch('/api/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invoice Template',
        pdfUrl: pdfFile.url,
        schema: schema
      })
    });
  };
  
  return (
    <PDFTemplateBuilder
      pdfFile={pdfFile}
      onSchemaExport={handleSchemaExport}
    />
  );
}

// User: Data Entry Form
import { PDFForm } from '@jyothiswarup/pdf-template-builder';

function UserPDFForm({ templateId }) {
  const [template, setTemplate] = useState(null);
  
  useEffect(() => {
    // Load template schema
    fetch(`/api/templates/${templateId}`)
      .then(res => res.json())
      .then(setTemplate);
  }, [templateId]);
  
  const handleSubmit = async (userData) => {
    // Generate PDF
    const response = await fetch(`/api/templates/${templateId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ data: userData })
    });
    
    // Download PDF
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };
  
  if (!template) return <div>Loading...</div>;
  
  return (
    <PDFForm
      schema={template.schema}
      fieldLabels={template.fieldLabels}
      onSubmit={handleSubmit}
    />
  );
}
```

## Decision Matrix

| Scenario | Backend Package | Frontend Package | Recommendation |
|----------|----------------|------------------|----------------|
| Simple server-side only | ✅ | ❌ | Use backend package only |
| Need visual field mapping | ✅ | ✅ | Use both packages |
| Custom UI, just need engine | ✅ | ❌ | Use backend package only |
| Building admin dashboard | ✅ | ✅ | Use both packages |

## Next Steps

1. **Keep backend package as-is** ✅ (Already published)
2. **Create frontend package**:
   - Extract React components from current frontend
   - Make them reusable and configurable
   - Publish as `@jyothiswarup/pdf-template-builder`
3. **Update documentation**:
   - Add architecture guide
   - Add examples for both packages
   - Add workflow diagrams

## Summary

**For your use case** (Admin sets fields → Users fill data → Generate PDF):

1. ✅ **Backend package** - Already done, use for PDF generation
2. ✅ **Frontend package** - Create for admin field mapping UI
3. ✅ **Database** - Store template schemas
4. ✅ **API** - Endpoints for template CRUD and PDF generation
5. ✅ **User form** - Simple form that maps to schema keys

This gives you:
- Reusable components
- Clear separation of concerns
- Easy to maintain
- Scalable architecture

