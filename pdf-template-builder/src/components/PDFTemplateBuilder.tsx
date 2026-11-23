import { useState, useCallback, useEffect, useRef } from 'react';
import { PDFUploader } from './PDFUploader';
import { PDFViewer } from './PDFViewer';
import { FieldMapper } from './FieldMapper';
import { Toolbar } from './Toolbar';
import { usePDF } from '../hooks/usePDF';
import { PDFField, FieldData, SchemaField } from '../types';
import { exportSchema } from '../utils/exportSchema';
// Styles should be imported by the consuming application
// import '@jyothiswarup/pdf-template-builder/styles';

/** Default size of a new field box, in PDF points */
const DEFAULT_FIELD_WIDTH = 150;
const DEFAULT_FIELD_HEIGHT = 20;

export interface PDFTemplateBuilderProps {
  /** PDF file to load as the template on mount (users can still upload another) */
  pdfFile?: File | null;
  /** Initial schema (for editing existing templates), applied to the first PDF loaded */
  initialSchema?: SchemaField[];
  /** Initial sample values keyed by field key, applied together with initialSchema */
  initialData?: FieldData;
  /** Callback when schema changes */
  onSchemaChange?: (schema: SchemaField[]) => void;
  /** Callback when schema is exported */
  onSchemaExport?: (schema: SchemaField[]) => void;
  /** Callback to generate PDF */
  onGenerate?: (schema: SchemaField[], data: FieldData, pdfFile: File) => Promise<void>;
  /** API endpoint for PDF generation (optional) */
  apiEndpoint?: string;
  /** Mode: 'builder' for field mapping, 'viewer' for read-only */
  mode?: 'builder' | 'viewer';
  /** Custom className */
  className?: string;
}

/**
 * Main component for PDF template building
 * Combines PDF upload, field mapping, and PDF generation
 */
export function PDFTemplateBuilder({
  pdfFile: initialPdfFile,
  initialSchema,
  initialData,
  onSchemaChange,
  onSchemaExport,
  onGenerate,
  apiEndpoint,
  mode = 'builder',
  className = '',
}: PDFTemplateBuilderProps) {
  const { pages, loading, error, loadPDF, getCanvasRef } = usePDF();
  const [fields, setFields] = useState<PDFField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [fieldData, setFieldData] = useState<FieldData>({});
  const [pdfFile, setPdfFile] = useState<File | null>(initialPdfFile || null);
  const [generating, setGenerating] = useState(false);

  // initialSchema / initialData are applied once, to the first PDF that loads
  const applyInitialRef = useRef(true);

  // Load the PDF passed in via the `pdfFile` prop
  useEffect(() => {
    if (!initialPdfFile) return;
    setPdfFile(initialPdfFile);
    loadPDF(initialPdfFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPdfFile]);

  // Apply initial schema (PDF points, 1-indexed pages) once the PDF pages are available
  useEffect(() => {
    if (!applyInitialRef.current || pages.length === 0) return;
    applyInitialRef.current = false;
    if (initialSchema) {
      setFields(
        initialSchema.map((field, index) => ({
          id: `field-${index}`,
          key: field.key,
          x: field.x,
          y: field.y,
          width: field.width ?? DEFAULT_FIELD_WIDTH,
          height: field.height ?? DEFAULT_FIELD_HEIGHT,
          page: (field.page ?? 1) - 1, // Convert to 0-indexed
          fontSize: field.fontSize || 12,
        }))
      );
    }
    if (initialData) {
      setFieldData({ ...initialData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  const handleFileSelect = useCallback((file: File) => {
    setPdfFile(file);
    setFields([]);
    setSelectedFieldId(null);
    setFieldData({});
    loadPDF(file);
  }, [loadPDF]);

  const handleFieldAdd = useCallback((pageNumber?: number, x?: number, y?: number) => {
    if (mode === 'viewer') return;
    
    const targetPage = pageNumber !== undefined ? pageNumber : currentPage;
    const newField: PDFField = {
      id: `field-${Date.now()}`,
      key: `field${fields.length + 1}`,
      x: x !== undefined ? x : 36,
      y: y !== undefined ? y : 36,
      width: DEFAULT_FIELD_WIDTH,
      height: DEFAULT_FIELD_HEIGHT,
      page: targetPage,
      fontSize: 12,
    };
    setFields((prev) => {
      const updated = [...prev, newField];
      // Notify schema change
      if (onSchemaChange && pages.length > 0) {
        const schema = exportSchema(updated, pages);
        onSchemaChange(schema);
      }
      return updated;
    });
    setSelectedFieldId(newField.id);
    if (pageNumber !== undefined) {
      setCurrentPage(pageNumber);
    }
  }, [fields.length, currentPage, mode, onSchemaChange, pages]);

  const handleFieldUpdate = useCallback((fieldId: string, updates: Partial<PDFField>) => {
    setFields((prev) => {
      // Validate and sanitize updates to ensure page is always a number
      const sanitizedUpdates: Partial<PDFField> = { ...updates };
      if ('page' in sanitizedUpdates && sanitizedUpdates.page !== undefined) {
        // Ensure page is a number, not a DOM element or object
        if (typeof sanitizedUpdates.page !== 'number') {
          console.warn('Invalid page value in update, ignoring:', sanitizedUpdates.page);
          delete sanitizedUpdates.page;
        }
      }
      
      const updated = prev.map((field) => (field.id === fieldId ? { ...field, ...sanitizedUpdates } : field));
      // Notify schema change
      if (onSchemaChange && pages.length > 0) {
        const schema = exportSchema(updated, pages);
        onSchemaChange(schema);
      }
      return updated;
    });
  }, [onSchemaChange, pages]);

  const handleFieldDelete = useCallback((fieldId: string) => {
    const fieldToDelete = fields.find((f) => f.id === fieldId);
    setFields((prev) => {
      const updated = prev.filter((field) => field.id !== fieldId);
      // Notify schema change
      if (onSchemaChange && pages.length > 0) {
        const schema = exportSchema(updated, pages);
        onSchemaChange(schema);
      }
      return updated;
    });
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    if (fieldToDelete) {
      setFieldData((prev) => {
        const { [fieldToDelete.key]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [selectedFieldId, fields, onSchemaChange, pages]);

  const handleGeneratePDF = useCallback(async (
    schema: SchemaField[],
    data: FieldData,
    file: File
  ) => {
    if (onGenerate) {
      // Use custom generate handler
      setGenerating(true);
      try {
        await onGenerate(schema, data, file);
      } finally {
        setGenerating(false);
      }
    } else if (apiEndpoint) {
      // Use API endpoint
      setGenerating(true);
      try {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('schema', JSON.stringify(schema));
        formData.append('data', JSON.stringify(data));

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        // Download the generated PDF
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
      } finally {
        setGenerating(false);
      }
    }
  }, [onGenerate, apiEndpoint]);

  const handleFieldDataChange = useCallback((key: string, value: string) => {
    setFieldData((prev) => {
      const updated = { ...prev, [key]: value };
      if (value === '') {
        const { [key]: _, ...rest } = updated;
        return rest;
      }
      return updated;
    });
  }, []);

  return (
    <div className={`pdf-template-builder ${className}`}>
      <div className="pdf-template-builder-content">
        <div className="pdf-template-builder-sidebar">
          <div className="pdf-template-builder-section">
            <PDFUploader onFileSelect={handleFileSelect} loading={loading} />
            {error && <div className="error-message">{error}</div>}
          </div>

          {pages.length > 0 && (
            <>
              {mode === 'builder' && (
                <div className="pdf-template-builder-section">
                  <FieldMapper
                    fields={fields}
                    selectedFieldId={selectedFieldId}
                    onFieldAdd={handleFieldAdd}
                    onFieldUpdate={handleFieldUpdate}
                    onFieldDelete={handleFieldDelete}
                    onFieldSelect={setSelectedFieldId}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    pages={pages}
                    fieldData={fieldData}
                    onFieldDataChange={handleFieldDataChange}
                  />
                </div>
              )}

              <div className="pdf-template-builder-section">
                <Toolbar
                  fields={fields}
                  pages={pages}
                  fieldData={fieldData}
                  pdfFile={pdfFile}
                  onGeneratePDF={handleGeneratePDF}
                  generating={generating}
                  onSchemaExport={onSchemaExport}
                />
              </div>
            </>
          )}
        </div>

        <div className="pdf-template-builder-main">
          {pages.length > 0 ? (
            <PDFViewer
              pages={pages}
              fields={fields}
              selectedFieldId={selectedFieldId}
              onFieldSelect={setSelectedFieldId}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
              onFieldAdd={mode === 'builder' ? handleFieldAdd : undefined}
              getCanvasRef={getCanvasRef}
              fieldData={fieldData}
            />
          ) : (
            <div className="empty-state">
              <p>Upload a PDF file to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

