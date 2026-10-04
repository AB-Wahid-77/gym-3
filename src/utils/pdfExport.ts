// ============================================================================
// IRONFORGE - PDF Generation & Native Sharing Engine
// Client-side direct PDF generation via html2canvas & jsPDF.
// Features off-screen clone isolation, animation & heavy filter stripping,
// scale optimization (1.5x), and a 20-second timeout safeguard.
// Supports multi-page splitting, direct downloading, and Web Share API.
// ============================================================================

import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PdfExportResult {
  shared: boolean;
  downloadedFallback: boolean;
}

/**
 * Captures an HTML element into an HTMLCanvasElement with optimization and a 20s timeout safeguard.
 * Clones the target into an off-screen sandbox, stripping animations, transitions, and heavy filters
 * to prevent html2canvas from hanging or lagging.
 */
async function captureElementWithTimeout(
  element: HTMLElement,
  timeoutMs: number = 20000
): Promise<HTMLCanvasElement> {
  const startTime = performance.now();
  const sandboxId = `pdf-sandbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Create an isolated off-screen sandbox container
  const container = document.createElement('div');
  container.id = sandboxId;
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  const targetWidth = element.offsetWidth || 800;
  container.style.width = `${targetWidth}px`;
  container.style.margin = '0';
  container.style.padding = '0';
  container.style.zIndex = '-9999';
  container.style.overflow = 'visible';
  container.style.pointerEvents = 'none';

  // 2. Clone the target element
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${targetWidth}px`;
  clone.style.margin = '0';

  // 3. Remove or hide any spinning/loading icons inside the clone
  const spinners = clone.querySelectorAll('.animate-spin, [class*="animate-spin"]');
  spinners.forEach((spinEl) => {
    spinEl.remove();
  });

  // 4. Remove heavy inline animation/filter styles on all cloned nodes
  const allClonedElements = clone.querySelectorAll<HTMLElement>('*');
  allClonedElements.forEach((el) => {
    if (el.style) {
      if (el.style.animation) el.style.animation = 'none';
      if (el.style.transition) el.style.transition = 'none';
      if ((el.style as any).backdropFilter) (el.style as any).backdropFilter = 'none';
      if ((el.style as any).webkitBackdropFilter) (el.style as any).webkitBackdropFilter = 'none';
      if (el.style.filter) el.style.filter = 'none';
    }
  });

  // 5. Inject scoped style override for the sandbox to disable animations and replace heavy blur/shadows
  const styleOverride = document.createElement('style');
  styleOverride.textContent = `
    #${sandboxId},
    #${sandboxId} * {
      animation: none !important;
      -webkit-animation: none !important;
      transition: none !important;
      -webkit-transition: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      filter: none !important;
      -webkit-filter: none !important;
      text-shadow: none !important;
    }
    #${sandboxId} .animate-spin,
    #${sandboxId} [class*="animate-spin"] {
      display: none !important;
    }
    #${sandboxId} [class*="shadow"] {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15) !important;
    }
  `;

  container.appendChild(styleOverride);
  container.appendChild(clone);
  document.body.appendChild(container);

  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

  try {
    // Render the stripped clone with optimized 1.5x scale
    const renderPromise = html2canvas(clone, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: null,
      ignoreElements: (el) => {
        return (
          el.classList.contains('no-print') ||
          el.getAttribute('data-pdf-ignore') === 'true'
        );
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => {
        const elapsed = Math.round(performance.now() - startTime);
        console.error(
          `[PDF Export] html2canvas timed out after ${elapsed}ms (stage: html2canvas rendering clone element)`
        );
        reject(
          new Error(
            `PDF generation timed out after ${Math.round(timeoutMs / 1000)} seconds. Please try printing instead.`
          )
        );
      }, timeoutMs);
    });

    const canvas = await Promise.race([renderPromise, timeoutPromise]);
    return canvas;
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);
    console.error(`[PDF Export] Failed during captureElementWithTimeout after ${elapsed}ms:`, err);
    throw err;
  } finally {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Renders an HTML element into a high-fidelity multi-page PDF document
 */
export async function generatePdfFromElement(
  element: HTMLElement
): Promise<{ blob: Blob; doc: jsPDF }> {
  // Capture with 1.5x resolution and 20-second timeout on stripped clone
  const canvas = await captureElementWithTimeout(element, 20000);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Scale canvas image proportionally to A4 page width
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  // Add subsequent pages if content exceeds 1 page
  while (heightLeft > 5) {
    position = heightLeft - imgHeight;
    doc.addPage();
    doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  const blob = doc.output('blob');
  return { blob, doc };
}

/**
 * Downloads the specified HTML element as a PDF file directly
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const sanitizedName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const { doc } = await generatePdfFromElement(element);
  doc.save(sanitizedName);
}

/**
 * Shares the PDF using Web Share API (WhatsApp, Gmail, etc.)
 * If not supported by the browser, automatically falls back to direct download.
 */
export async function shareElementAsPdf(
  element: HTMLElement,
  fileName: string,
  title: string,
  text: string
): Promise<PdfExportResult> {
  const sanitizedName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const { blob, doc } = await generatePdfFromElement(element);

  const file = new File([blob], sanitizedName, { type: 'application/pdf' });

  // Check if Web Share API with files is supported
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title,
        text,
      });
      return { shared: true, downloadedFallback: false };
    } catch (err: any) {
      // User cancelled share dialog
      if (err?.name === 'AbortError') {
        return { shared: false, downloadedFallback: false };
      }
      // System share failed - fallback to direct download
      doc.save(sanitizedName);
      return { shared: false, downloadedFallback: true };
    }
  } else {
    // Web Share API not supported on this browser/platform - direct download fallback
    doc.save(sanitizedName);
    return { shared: false, downloadedFallback: true };
  }
}
