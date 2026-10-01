import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist'

export type LoadedPdf = {
  pageCount: number
  renderPage: (pageNumber: number, canvas: HTMLCanvasElement) => Promise<void>
  destroy: () => void
}

// Rendering at devicePixelRatio keeps text sharp on retina displays; the canvas is then scaled back
// down in CSS. Capped because a 4x buffer on a large page allocates a lot of memory for no gain.
const pixelRatio = () => Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, 2)

/**
 * pdf.js is loaded on first use rather than at module scope, for two reasons: it is around a
 * megabyte that most visitors never need (most documents are not PDFs), and it touches browser-only
 * globals as soon as it is imported, which would otherwise break any test that merely renders a
 * component somewhere up the tree from here.
 */
const pdfjs = async () => {
  const lib = await import('pdfjs-dist')
  if (!lib.GlobalWorkerOptions.workerSrc) {
    const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    lib.GlobalWorkerOptions.workerSrc = workerUrl.default
  }
  return lib
}

/**
 * Parses `bytes` as a PDF, returning a handle that can paint pages onto a canvas.
 *
 * Returns null when the bytes are not a readable PDF. That is a normal outcome, not an error: the
 * magic-byte sniff only proves the file starts with "%PDF", so anything truncated or corrupt lands
 * here, and the caller falls back to offering a download.
 *
 * These bytes are decrypted from a public envelope and may be attacker-authored, which drives two
 * choices here. A PDF's own embedded JavaScript never runs: executing it requires the pdf.js
 * *viewer's* scripting manager, and this code drives the parsing API directly, only ever asking for
 * pixels. And nothing is fetched over the network while parsing — a document cannot use a font or
 * colour-profile reference to make the browser call out to a URL of its choosing.
 */
export const loadPdf = async (bytes: Uint8Array): Promise<LoadedPdf | null> => {
  let task: PDFDocumentLoadingTask
  let doc: PDFDocumentProxy
  try {
    const { getDocument } = await pdfjs()
    task = getDocument({
      // pdf.js takes ownership of the buffer it is handed, and the caller still needs these bytes
      // for the download button, so it gets a copy.
      data: new Uint8Array(bytes),
      // Everything the document might otherwise pull in stays local: no worker-side fetches, no
      // streaming, no speculative range requests. (An isEvalSupported flag used to belong here too;
      // pdf.js 6 dropped eval-based font handling altogether, so there is nothing left to disable.)
      useWorkerFetch: false,
      disableAutoFetch: true,
      disableStream: true
    })
    doc = await task.promise
  } catch {
    return null
  }

  return {
    pageCount: doc.numPages,
    renderPage: async (pageNumber, canvas) => {
      const page = await doc.getPage(pageNumber)
      const ratio = pixelRatio()
      const viewport = page.getViewport({ scale: ratio })
      const context = canvas.getContext('2d')
      if (!context) return

      canvas.width = viewport.width
      canvas.height = viewport.height
      // CSS size is the unscaled page; the extra buffer resolution is what sharpens the render.
      canvas.style.width = `${viewport.width / ratio}px`
      canvas.style.height = `${viewport.height / ratio}px`

      await page.render({ canvas, canvasContext: context, viewport }).promise
    },
    // Tears down the worker and aborts anything still in flight. Owned by the loading task rather
    // than the document, so the task is what is held onto above.
    destroy: () => {
      void task.destroy()
    }
  }
}
