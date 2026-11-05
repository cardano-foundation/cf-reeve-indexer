import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist'

// In PDF points, or CSS px once multiplied by a scale.
export type PageSize = { width: number; height: number }

export type RenderOptions = {
  // CSS px per PDF point. 1 by default.
  scale?: number
  // Aborting stops the drawing; the canvas is then free for the next render.
  signal?: AbortSignal
}

export type LoadedPdf = {
  pageCount: number
  // Page 1 at scale 1, used to lay pages out before they are drawn. Optional, because the viewer
  // has a fallback page size.
  firstPageSize?: PageSize
  // Resolves with the page's size at scale 1 once it is drawn, or undefined if the render was
  // aborted before it finished.
  renderPage: (pageNumber: number, canvas: HTMLCanvasElement, options?: RenderOptions) => Promise<PageSize | undefined>
  destroy: () => void
}

// iOS Safari refuses to draw a canvas larger than this many pixels; the page would stay blank.
export const MAX_CANVAS_PIXELS = 16_777_216

/**
 * How many canvas pixels to use per CSS pixel. Rendering at devicePixelRatio keeps text sharp on
 * retina displays; it is capped at 2 because more costs memory for no visible gain, and lowered
 * further when a large, zoomed page would otherwise exceed MAX_CANVAS_PIXELS.
 */
export const renderRatio = (cssWidth: number, cssHeight: number, devicePixelRatio: number): number => {
  const area = cssWidth * cssHeight
  if (!Number.isFinite(area) || area <= 0) return 1
  return Math.min(devicePixelRatio || 1, 2, Math.sqrt(MAX_CANVAS_PIXELS / area))
}

const isRenderCancelled = (error: unknown) => (error as { name?: unknown } | null)?.name === 'RenderingCancelledException'

// Teardown is best effort: pdf.js rejects if the worker fails to terminate, and nobody is waiting
// on the result, so an unhandled rejection is all that would come of it.
const destroyQuietly = (task: PDFDocumentLoadingTask | undefined) => {
  task?.destroy().catch(() => undefined)
}

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
  let task: PDFDocumentLoadingTask | undefined
  let doc: PDFDocumentProxy
  let firstPageSize: PageSize
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
    const firstPage = (await doc.getPage(1)).getViewport({ scale: 1 })
    firstPageSize = { width: firstPage.width, height: firstPage.height }
  } catch (error) {
    // The viewer only says the file "could not be read"; the console says why. A broken file and a
    // pdf.js that cannot start (e.g. its worker served with the wrong content type) look the same
    // on screen. Only the error is logged, never the document's bytes.
    console.error('Could not open the PDF for preview:', error)
    // Nothing will be shown, so nothing is kept alive either.
    destroyQuietly(task)
    return null
  }

  return {
    pageCount: doc.numPages,
    firstPageSize,
    renderPage: async (pageNumber, canvas, { scale = 1, signal } = {}) => {
      if (signal?.aborted) return undefined
      const page = await doc.getPage(pageNumber)
      if (signal?.aborted) return undefined

      const cssViewport = page.getViewport({ scale })
      const ratio = renderRatio(cssViewport.width, cssViewport.height, typeof window === 'undefined' ? 1 : window.devicePixelRatio)
      const viewport = page.getViewport({ scale: scale * ratio })
      const context = canvas.getContext('2d')
      if (!context) return undefined

      // Whole pixels, so the canvas never exceeds MAX_CANVAS_PIXELS through rounding up.
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      // CSS size is the page at `scale`; the extra buffer resolution is what sharpens the render.
      canvas.style.width = `${Math.floor(cssViewport.width)}px`
      canvas.style.height = `${Math.floor(cssViewport.height)}px`

      const rendering = page.render({ canvas, canvasContext: context, viewport })
      // Cancelling frees the canvas at once, so a render at a new zoom can start on it straight away.
      const cancel = () => rendering.cancel()
      signal?.addEventListener('abort', cancel, { once: true })
      try {
        await rendering.promise
      } catch (error) {
        if (isRenderCancelled(error)) return undefined
        throw error
      } finally {
        signal?.removeEventListener('abort', cancel)
      }

      const size = page.getViewport({ scale: 1 })
      return { width: size.width, height: size.height }
    },
    // Tears down the worker and aborts anything still in flight. Owned by the loading task rather
    // than the document, so the task is what is held onto above.
    destroy: () => {
      destroyQuietly(task)
    }
  }
}
