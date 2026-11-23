import { useRef, useState } from 'react';
import { PDFPage } from '../types';

/** Resolution the pages are rasterised at (CSS then scales the canvas to fit). */
export const RENDER_SCALE = 1.5;

let getDocument: any;
let GlobalWorkerOptions: any;
const PDFJS_VERSION = '3.11.174';
const WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

const loadPdfJs = async (): Promise<{ getDocument: any; GlobalWorkerOptions: any }> => {
  if (getDocument && GlobalWorkerOptions) {
    return { getDocument, GlobalWorkerOptions };
  }

  return new Promise((resolve, reject) => {
    const w = window as any;
    const useLib = (pdfjs: any) => {
      getDocument = pdfjs.getDocument;
      GlobalWorkerOptions = pdfjs.GlobalWorkerOptions;
      if (GlobalWorkerOptions) {
        GlobalWorkerOptions.workerSrc = WORKER_SRC;
      }
      resolve({ getDocument, GlobalWorkerOptions });
    };

    if (w.pdfjsLib) {
      useLib(w.pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
    script.async = true;
    script.onload = () => {
      const pdfjs = w.pdfjsLib || w.pdfjs || w.PDFJS;
      if (pdfjs && pdfjs.getDocument) {
        useLib(pdfjs);
      } else {
        reject(new Error('PDF.js getDocument function not found'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
    document.head.appendChild(script);
  });
};

if (typeof window !== 'undefined') {
  loadPdfJs().catch((error) => {
    console.error('Failed to initialize PDF.js:', error);
  });
}

export function usePDF() {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  const renderPage = async (pdf: any, pageNum: number): Promise<PDFPage> => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    // Page size in points, as displayed (CropBox + /Rotate applied)
    const viewport1x = page.getViewport({ scale: 1 });

    const canvas = document.createElement('canvas');
    canvasRefs.current.set(pageNum - 1, canvas);
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    return {
      pageNumber: pageNum - 1, // 0-indexed
      canvas,
      width: viewport.width,
      height: viewport.height,
      pdfWidth: viewport1x.width,
      pdfHeight: viewport1x.height,
    };
  };

  const loadPDF = async (file: File) => {
    setLoading(true);
    setError(null);
    canvasRefs.current.clear();

    try {
      const { getDocument: getDoc } = await loadPdfJs();
      if (!getDoc) {
        throw new Error('getDocument is not available. PDF.js may not be loaded correctly.');
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDoc({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);

      const renderedPages: PDFPage[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        renderedPages.push(await renderPage(pdf, i));
      }
      setPages(renderedPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
      setPdfDoc(null);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const getCanvasRef = (pageNumber: number) => (element: HTMLCanvasElement | null) => {
    if (element) {
      canvasRefs.current.set(pageNumber, element);
    }
  };

  return { pdfDoc, pages, loading, error, loadPDF, getCanvasRef };
}
