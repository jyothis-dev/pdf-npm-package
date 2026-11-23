import { useEffect, useState } from 'react';
import { PDFTemplateBuilder, type FieldData, type SchemaField } from '@jyothiswarup/pdf-template-builder';
import { SAMPLE_DATA, SAMPLE_SCHEMA } from './sample';

const REPO = 'https://github.com/jyothis-dev/pdf-npm-package';
const NPM_BUILDER = 'https://www.npmjs.com/package/@jyothiswarup/pdf-template-builder';
const NPM_ENGINE = 'https://www.npmjs.com/package/@jyothiswarup/pdf-template-engine';

export function App() {
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [schema, setSchema] = useState<SchemaField[]>(SAMPLE_SCHEMA);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load the bundled sample certificate so visitors can try it immediately
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}sample-certificate.pdf`)
      .then((r) => r.blob())
      .then((b) => setSampleFile(new File([b], 'sample-certificate.pdf', { type: 'application/pdf' })))
      .catch(() => setSampleFile(null));
  }, []);

  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  // Fill the PDF right here in the browser — no server involved
  const handleGenerate = async (s: SchemaField[], data: FieldData, file: File) => {
    const { fillPdf } = await import('@jyothiswarup/pdf-template-engine'); // loaded on demand
    const bytes = await fillPdf(await file.arrayBuffer(), s, data);
    setResultUrl(URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' })));
    requestAnimationFrame(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }));
  };

  const schemaJson = JSON.stringify(schema, null, 2);
  const copySchema = async () => {
    try {
      await navigator.clipboard.writeText(schemaJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Open source · React · TypeScript</p>
          <h1>Place fields on any PDF. Fill it from JSON.</h1>
          <p className="lede">
            Drag text fields onto an existing PDF (a certificate, invoice or form), export the layout as JSON,
            then fill it with data in the browser, on serverless, or in Node.js.
          </p>
          <div className="install">
            <code>npm i @jyothiswarup/pdf-template-builder @jyothiswarup/pdf-template-engine</code>
          </div>
          <nav className="links">
            <a href={REPO}>GitHub</a>
            <a href={NPM_BUILDER}>Builder on npm</a>
            <a href={NPM_ENGINE}>Engine on npm</a>
          </nav>
        </div>
      </header>

      <main className="content">
        <ol className="steps">
          <li><strong>Drag</strong> a field box to move it, or drag a corner to resize it. Click anywhere on the page to add a field.</li>
          <li><strong>Edit</strong> the sample values in the sidebar, or upload your own PDF.</li>
          <li><strong>Generate PDF</strong> fills the template in your browser. Nothing is uploaded.</li>
        </ol>

        <section className="builder-card">
          {sampleFile ? (
            <PDFTemplateBuilder
              pdfFile={sampleFile}
              initialSchema={SAMPLE_SCHEMA}
              initialData={SAMPLE_DATA}
              onSchemaChange={setSchema}
              onSchemaExport={copySchema}
              onGenerate={handleGenerate}
            />
          ) : (
            <p className="loading">Loading sample certificate…</p>
          )}
        </section>

        {resultUrl && (
          <section id="result" className="result">
            <div className="section-head">
              <h2>Generated PDF</h2>
              <a className="button" href={resultUrl} download="filled.pdf">Download</a>
            </div>
            <iframe title="Generated PDF" src={resultUrl} />
          </section>
        )}

        <section className="code-grid">
          <div>
            <div className="section-head">
              <h2>Your schema</h2>
              <button className="button ghost" onClick={copySchema}>{copied ? 'Copied' : 'Copy JSON'}</button>
            </div>
            <pre className="code"><code>{schemaJson}</code></pre>
          </div>
          <div>
            <h2>Use it in your app</h2>
            <pre className="code"><code>{`import { fillPdf } from '@jyothiswarup/pdf-template-engine';

// Browser, serverless or Node.js
const pdf = await fillPdf(templateBytes, schema, {
  studentName: 'Ada Lovelace',
  courseName: 'Analytical Engines',
});

// Node.js: read and write files directly
import { generatePDF } from '@jyothiswarup/pdf-template-engine';
await generatePDF({
  templatePath: './certificate.pdf',
  outputPath: './out/ada.pdf',
  fields: schema,
  data: { studentName: 'Ada Lovelace' },
});`}</code></pre>
          </div>
        </section>
      </main>

      <footer className="footer">
        MIT licensed · <a href={REPO}>Source on GitHub</a> · <a href={`${REPO}/issues`}>Report an issue</a>
      </footer>
    </div>
  );
}
