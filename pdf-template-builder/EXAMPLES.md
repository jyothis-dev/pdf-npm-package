# Usage Examples

## Example 1: Basic Setup

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

## Example 2: Save Schema to Database

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';

function TemplateBuilder() {
  const handleSchemaExport = async (schema) => {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invoice Template',
        schema: schema
      })
    });
    
    if (response.ok) {
      alert('Template saved successfully!');
    }
  };

  return (
    <PDFTemplateBuilder
      onSchemaExport={handleSchemaExport}
    />
  );
}
```

## Example 3: Auto-save on Changes

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';
import { useCallback } from 'react';

function AutoSaveBuilder({ templateId }) {
  const handleSchemaChange = useCallback((schema) => {
    // Debounce or throttle this in production
    fetch(`/api/templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema })
    });
  }, [templateId]);

  return (
    <PDFTemplateBuilder
      onSchemaChange={handleSchemaChange}
    />
  );
}
```

## Example 4: Custom PDF Generation Handler

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';

function CustomGenerator() {
  const handleGenerate = async (schema, data, pdfFile) => {
    // Custom logic before generation
    console.log('Generating PDF with:', { schema, data });
    
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('schema', JSON.stringify(schema));
    formData.append('data', JSON.stringify(data));

    const response = await fetch('/api/custom-generate', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Generation failed');
    }

    const blob = await response.blob();
    
    // Custom handling
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <PDFTemplateBuilder
      onGenerate={handleGenerate}
    />
  );
}
```

## Example 5: Load Existing Template

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';
import { useState, useEffect } from 'react';

function EditTemplate({ templateId }) {
  const [template, setTemplate] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplate() {
      const res = await fetch(`/api/templates/${templateId}`);
      const data = await res.json();
      setTemplate(data);
      
      // Load PDF file
      const pdfRes = await fetch(data.pdfUrl);
      const pdfBlob = await pdfRes.blob();
      const file = new File([pdfBlob], 'template.pdf', { type: 'application/pdf' });
      setPdfFile(file);
      
      setLoading(false);
    }
    loadTemplate();
  }, [templateId]);

  if (loading) return <div>Loading template...</div>;
  if (!template) return <div>Template not found</div>;

  return (
    <PDFTemplateBuilder
      pdfFile={pdfFile}
      initialSchema={template.schema}
      onSchemaChange={(schema) => {
        // Auto-save
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

## Example 6: Viewer Mode (Read-only)

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';

function TemplateViewer({ schema, pdfFile }) {
  return (
    <PDFTemplateBuilder
      pdfFile={pdfFile}
      initialSchema={schema}
      mode="viewer"  // Read-only mode
    />
  );
}
```

## Example 7: Using Individual Components

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

function CustomLayout() {
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
    const formData = new FormData();
    formData.append('pdf', pdfFile!);
    formData.append('schema', JSON.stringify(schema));
    formData.append('data', JSON.stringify(fieldData));

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      body: formData,
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '300px', padding: '1rem' }}>
        <PDFUploader onFileSelect={handleFileSelect} loading={loading} />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
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
      
      <div style={{ flex: 1, padding: '1rem' }}>
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

## Example 8: Integration with Form Library

```tsx
import { PDFTemplateBuilder, exportSchema } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';
import { useState } from 'react';

function FormWithPDFBuilder() {
  const [schema, setSchema] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);

  if (showBuilder) {
    return (
      <PDFTemplateBuilder
        onSchemaExport={(exportedSchema) => {
          setSchema(exportedSchema);
          setShowBuilder(false);
        }}
      />
    );
  }

  return (
    <div>
      <button onClick={() => setShowBuilder(true)}>
        Configure PDF Template
      </button>
      
      {schema && (
        <div>
          <h3>Template Configured</h3>
          <p>{schema.length} fields defined</p>
          {/* Your form here */}
        </div>
      )}
    </div>
  );
}
```

