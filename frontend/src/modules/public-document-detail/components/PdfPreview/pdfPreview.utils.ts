import type { PageSize } from 'modules/public-document-detail/utils/pdf.ts'

// A scale is CSS pixels per PDF point, the unit pdf.js renders in.
export const MIN_SCALE = 0.25

export const MAX_SCALE = 4

export const ZOOM_STEP = 1.25

// The pdf.js viewer calls 96/72 CSS px per PDF point "100%": the page at its printed size.
export const ACTUAL_SIZE_SCALE = 96 / 72

// Horizontal padding inside the viewer frame, on each side, in CSS px.
export const FRAME_PADDING_PX = 16

// US Letter in PDF points: the size a page is laid out at until pdf.js reports the real one.
export const DEFAULT_PAGE_SIZE: PageSize = { width: 612, height: 792 }

const clampScale = (scale: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))

/** The scale at which a page of `pageWidth` points fills a frame `frameWidth` px wide. */
export const fitScaleFor = (frameWidth: number, pageWidth: number): number => {
  const available = frameWidth - 2 * FRAME_PADDING_PX
  // Not measured yet (jsdom, a hidden frame) or a page without a usable size: draw at scale 1.
  if (!Number.isFinite(available) || !Number.isFinite(pageWidth) || available <= 0 || pageWidth <= 0) return 1
  return clampScale(available / pageWidth)
}

export const zoomIn = (scale: number) => clampScale(scale * ZOOM_STEP)

export const zoomOut = (scale: number) => clampScale(scale / ZOOM_STEP)

export const zoomPercent = (scale: number) => `${Math.round((scale / ACTUAL_SIZE_SCALE) * 100)}%`
