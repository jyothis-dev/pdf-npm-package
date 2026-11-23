import { useCallback } from 'react';
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';
import './App.css';

function App() {
  const handleSchemaExport = useCallback((schema: any) => {
    console.log('Schema exported:', schema);
    // You can save this to your database or file system
    alert(`Schema exported with ${schema.length} fields!`);
  }, []);

  const handleGenerate = useCallback(async (schema: any, data: any, pdfFile: File) => {
    console.log('Generating PDF with:', { schema, data, pdfFile });
    
    // Send to your backend API
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('schema', JSON.stringify(schema));
    formData.append('data', JSON.stringify(data));

    try {
      const response = await fetch('http://localhost:3000/pdf', {
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

      alert('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>PDF Template Playground</h1>
        <p>Upload a PDF, map fields, and generate templates</p>
      </header>

      <div className="app-content">
        <PDFTemplateBuilder
          apiEndpoint="http://localhost:3000/pdf"
          onSchemaExport={handleSchemaExport}
          onGenerate={handleGenerate}
          mode="builder"
        />
      </div>
    </div>
  );
}

export default App;

