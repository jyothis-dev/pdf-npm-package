import type { SchemaField } from '@jyothiswarup/pdf-template-builder';

// Field positions for public/sample-certificate.pdf (PDF points, top-left origin)
export const SAMPLE_SCHEMA: SchemaField[] = [
  { key: 'studentName', x: 231, y: 228, width: 380, height: 32, fontSize: 24, page: 1 },
  { key: 'courseName', x: 231, y: 326, width: 380, height: 32, fontSize: 18, page: 1 },
  { key: 'issuedOn', x: 110, y: 444, width: 190, height: 24, fontSize: 13, page: 1 },
  { key: 'certificateId', x: 542, y: 444, width: 190, height: 24, fontSize: 13, page: 1 },
];

export const SAMPLE_DATA = {
  studentName: 'Ada Lovelace',
  courseName: 'Introduction to Analytical Engines',
  issuedOn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  certificateId: 'CERT-2026-0001',
};
