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

/**
 * Where the page is drawn inside its wrapper, in the wrapper's own (local,
 * untransformed) CSS pixels: `ox`/`oy` is the top-left of the canvas content
 * box, `sx`/`sy` are local pixels per PDF point. Field boxes are positioned
 * with these values.
 */
type Geometry = { sx: number; sy: number; ox: number; oy: number };

/**
 * Measures the page canvas in LOCAL layout pixels (offset/client sizes), which
 * is the coordinate space absolutely-positioned field boxes live in. Unlike
 * getBoundingClientRect this is not affected by CSS transforms or `zoom` on an
 * ancestor, so the overlay stays aligned inside scaled containers, modals, etc.
 * Host-app borders / padding on the canvas are accounted for too.
 */
function measureGeometry(page: PDFPage): Geometry | null {
  const canvas = page.canvas;
  if (!canvas.isConnected) return null;
  const cs = getComputedStyle(canvas);
  const padL = parseFloat(cs.paddingLeft) || 0;
  const padR = parseFloat(cs.paddingRight) || 0;
  const padT = parseFloat(cs.paddingTop) || 0;
  const padB = parseFloat(cs.paddingBottom) || 0;
  const contentW = canvas.clientWidth - padL - padR;
  const contentH = canvas.clientHeight - padT - padB;
  if (contentW <= 0 || contentH <= 0) return null;
  const { w, h } = pdfSize(page);
  return {
    sx: contentW / w,
    sy: contentH / h,
    ox: canvas.offsetLeft + canvas.clientLeft + padL,
    oy: canvas.offsetTop + canvas.clientTop + padT,
  };
}

/**
 * Screen pixels (as reported by mouse events) per local CSS pixel. This is
 * 1 normally, and differs when an ancestor is transformed / zoomed.
 */
function screenPerLocal(canvas: HTMLCanvasElement): { kx: number; ky: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    kx: canvas.offsetWidth > 0 ? rect.width / canvas.offsetWidth : 1,
    ky: canvas.offsetHeight > 0 ? rect.height / canvas.offsetHeight : 1,
  };
}

/** Converts a mouse position to PDF points on the page (top-left origin). */
function clientToPoints(page: PDFPage, geo: Geometry, clientX: number, clientY: number) {
  const canvas = page.canvas;
  const rect = canvas.getBoundingClientRect();
  const { kx, ky } = screenPerLocal(canvas);
  // local px from the canvas border-box edge -> from the content box -> points
  const localX = (clientX - rect.left) / kx - (geo.ox - canvas.offsetLeft);
  const localY = (clientY - rect.top) / ky - (geo.oy - canvas.offsetTop);
  return { x: localX / geo.sx, y: localY / geo.sy };
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
  const [geometry, setGeometry] = useState<Record<number, Geometry>>({});

  // Mount canvases and keep the per-page display scale up to date
  useEffect(() => {
    const measure = () => {
      const next: Record<number, Geometry> = {};
      pages.forEach((page) => {
        const g = measureGeometry(page);
        if (g) next[page.pageNumber] = g;
      });
      const eq = (a: Geometry, b: Geometry) =>
        (['sx', 'sy', 'ox', 'oy'] as const).every((k) => Math.abs(a[k] - b[k]) < 1e-6);
      setGeometry((prev) => {
        const same =
          Object.keys(next).length === Object.keys(prev).length &&
          Object.entries(next).every(([k, v]) => prev[Number(k)] && eq(prev[Number(k)], v));
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

  const getGeometry = (page: PDFPage): Geometry =>
    geometry[page.pageNumber] || measureGeometry(page) || { sx: 1, sy: 1, ox: 0, oy: 0 };

  const startInteraction = (
    e: ReactMouseEvent,
    field: PDFField,
    page: PDFPage,
    corner: string | null
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onFieldSelect(field.id);

    const geo = getGeometry(page);
    const { kx, ky } = screenPerLocal(page.canvas);
    const { w: pageW, h: pageH } = pdfSize(page);
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { x: field.x, y: field.y, width: field.width, height: field.height };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Mouse movement in screen pixels -> local CSS pixels -> points
      const dx = (moveEvent.clientX - startX) / kx / geo.sx;
      const dy = (moveEvent.clientY - startY) / ky / geo.sy;

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
        const geo = getGeometry(page);

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
                const geo = measureGeometry(page);
                if (!geo) return;
                const pt = clientToPoints(page, geo, e.clientX, e.clientY);
                const { w, h } = pdfSize(page);
                if (pt.x < 0 || pt.y < 0 || pt.x > w || pt.y > h) return; // outside the page
                onFieldAdd(page.pageNumber, pt.x, pt.y);
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
                      left: `${geo.ox + field.x * geo.sx}px`,
                      top: `${geo.oy + field.y * geo.sy}px`,
                      width: `${field.width * geo.sx}px`,
                      height: `${field.height * geo.sy}px`,
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
                          fontSize: `${fontSize * geo.sy}px`,
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
