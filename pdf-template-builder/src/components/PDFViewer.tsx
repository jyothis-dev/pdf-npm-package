import { useEffect, useRef, useState, MouseEvent as ReactMouseEvent } from 'react';
import { PDFField, PDFPage, FieldData } from '../types';
import { RENDER_SCALE } from '../hooks/usePDF';

interface PDFViewerProps {
  pages: PDFPage[];
  fields: PDFField[];
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<PDFField>) => void;
  onFieldDelete: (fieldId: string) => void;
  /** Called with the page and the click position in PDF points (top-left origin) */
  onFieldAdd?: (pageNumber: number, x: number, y: number) => void;
  getCanvasRef: (pageNumber: number) => (element: HTMLCanvasElement | null) => void;
  /** Optional sample values, previewed inside each field box */
  fieldData?: FieldData;
}

const MIN_WIDTH_PT = 20;
const MIN_HEIGHT_PT = 8;

const pdfSize = (page: PDFPage) => ({
  w: page.pdfWidth ?? page.width / RENDER_SCALE,
  h: page.pdfHeight ?? page.height / RENDER_SCALE,
});

/** CSS pixels per PDF point, measured separately per axis */
type Scale = { x: number; y: number };

/**
 * How large the page canvas is actually drawn on screen, relative to the page
 * size in points. Each axis is measured separately, so it stays correct even
 * if the host app's CSS stretches the canvas to a different aspect ratio.
 */
function measureScale(page: PDFPage): Scale | null {
  const canvas = page.canvas;
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const { w, h } = pdfSize(page);
  return { x: rect.width / w, y: rect.height / h };
}

/**
 * Renders the PDF pages with draggable / resizable field boxes on top.
 *
 * Fields are stored in PDF points. The canvas may be displayed at any size
 * (it shrinks to fit its container), so every page tracks its current
 * "CSS pixels per point" scale and converts between the two. This keeps the
 * boxes you see aligned with where the text is drawn in the generated PDF.
 */
export function PDFViewer({
  pages,
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldUpdate,
  onFieldAdd,
  fieldData,
}: PDFViewerProps) {
  const containerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [scales, setScales] = useState<Record<number, Scale>>({});

  // Mount canvases and keep the per-page display scale up to date
  useEffect(() => {
    const measure = () => {
      const next: Record<number, Scale> = {};
      pages.forEach((page) => {
        const s = measureScale(page);
        if (s) next[page.pageNumber] = s;
      });
      setScales((prev) => {
        const same =
          Object.keys(next).length === Object.keys(prev).length &&
          Object.entries(next).every(([k, v]) => {
            const p = prev[Number(k)];
            return p && Math.abs(p.x - v.x) < 1e-6 && Math.abs(p.y - v.y) < 1e-6;
          });
        return same ? prev : next;
      });
    };

    pages.forEach((page) => {
      const container = containerRefs.current.get(page.pageNumber);
      if (container && page.canvas && !container.contains(page.canvas)) {
        container.insertBefore(page.canvas, container.firstChild);
      }
    });
    measure();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    pages.forEach((page) => ro?.observe(page.canvas));
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pages]);

  const getScale = (page: PDFPage): Scale => scales[page.pageNumber] || { x: 1, y: 1 };

  const startInteraction = (
    e: ReactMouseEvent,
    field: PDFField,
    page: PDFPage,
    corner: string | null
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onFieldSelect(field.id);

    const scale = getScale(page);
    const { w: pageW, h: pageH } = pdfSize(page);
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { x: field.x, y: field.y, width: field.width, height: field.height };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Mouse movement in CSS pixels -> points
      const dx = (moveEvent.clientX - startX) / scale.x;
      const dy = (moveEvent.clientY - startY) / scale.y;

      if (!corner) {
        onFieldUpdate(field.id, {
          x: Math.max(0, Math.min(start.x + dx, pageW - start.width)),
          y: Math.max(0, Math.min(start.y + dy, pageH - start.height)),
        });
        return;
      }

      let { x, y, width, height } = start;
      if (corner.includes('e')) {
        width = Math.max(MIN_WIDTH_PT, Math.min(start.width + dx, pageW - start.x));
      }
      if (corner.includes('s')) {
        height = Math.max(MIN_HEIGHT_PT, Math.min(start.height + dy, pageH - start.y));
      }
      if (corner.includes('w')) {
        const right = start.x + start.width;
        x = Math.max(0, Math.min(start.x + dx, right - MIN_WIDTH_PT));
        width = right - x;
      }
      if (corner.includes('n')) {
        const bottom = start.y + start.height;
        y = Math.max(0, Math.min(start.y + dy, bottom - MIN_HEIGHT_PT));
        height = bottom - y;
      }
      onFieldUpdate(field.id, { x, y, width, height });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="pdf-viewer">
      {pages.map((page) => {
        const pageFields = fields.filter((f) => f.page === page.pageNumber);
        const scale = getScale(page);

        return (
          <div key={page.pageNumber} className="pdf-page-container">
            <div className="page-label">Page {page.pageNumber + 1}</div>
            <div
              ref={(el) => {
                if (el) {
                  containerRefs.current.set(page.pageNumber, el);
                  if (page.canvas && !el.contains(page.canvas)) {
                    el.insertBefore(page.canvas, el.firstChild);
                  }
                }
              }}
              className="canvas-wrapper"
              style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!onFieldAdd || target.closest('.field-box')) return;
                // Measure against the canvas itself so the origin is the page's top-left corner
                const rect = page.canvas.getBoundingClientRect();
                const s = measureScale(page);
                if (!s) return;
                onFieldAdd(page.pageNumber, (e.clientX - rect.left) / s.x, (e.clientY - rect.top) / s.y);
              }}
            >
              {pageFields.map((field) => {
                const sample = fieldData?.[field.key];
                const fontSize = field.fontSize || 12;
                return (
                  <div
                    key={field.id}
                    className={`field-box ${selectedFieldId === field.id ? 'selected' : ''}`}
                    style={{
                      position: 'absolute',
                      left: `${field.x * scale.x}px`,
                      top: `${field.y * scale.y}px`,
                      width: `${field.width * scale.x}px`,
                      height: `${field.height * scale.y}px`,
                      boxSizing: 'border-box',
                      cursor: 'move',
                      pointerEvents: 'auto',
                      lineHeight: 'normal',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFieldSelect(field.id);
                    }}
                    onMouseDown={(e) => startInteraction(e, field, page, null)}
                  >
                    <div className="field-label">{field.key || 'Unnamed'}</div>
                    {sample !== undefined && sample !== '' && (
                      <div
                        className="field-preview"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          fontSize: `${fontSize * scale.y}px`,
                          lineHeight: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'visible',
                          pointerEvents: 'none',
                          color: '#000',
                        }}
                      >
                        {String(sample)}
                      </div>
                    )}
                    {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
                      <div
                        key={corner}
                        className={`resize-handle resize-${corner}`}
                        onMouseDown={(e) => startInteraction(e, field, page, corner)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
