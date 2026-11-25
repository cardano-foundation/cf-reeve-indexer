import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { SearchZoomIn, SearchZoomOut } from 'iconsax-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import {
  DEFAULT_PAGE_SIZE,
  FRAME_PADDING_PX,
  MAX_SCALE,
  MIN_SCALE,
  fitScaleFor,
  zoomIn,
  zoomOut,
  zoomPercent
} from 'modules/public-document-detail/components/PdfPreview/pdfPreview.utils.ts'
import {
  PDF_FIT_WIDTH_LABEL,
  PDF_PAGE_POSITION,
  PDF_RENDERING_LABEL,
  PDF_VIEWER_LABEL,
  PDF_ZOOM_IN_LABEL,
  PDF_ZOOM_OUT_LABEL
} from 'modules/public-document-detail/constants/detail.consts.ts'
import { loadPdf, type LoadedPdf, type PageSize } from 'modules/public-document-detail/utils/pdf.ts'

type PdfPreviewProps = {
  bytes: Uint8Array
  // Called when the bytes start with "%PDF" but will not parse. The parent swaps to its
  // download-only fallback rather than leaving an empty frame on screen.
  onUnreadable: () => void
  // Reports the page count up so the viewer header can show it alongside the file size.
  onPageCount?: (pageCount: number) => void
}

type PdfPageProps = {
  pdf: LoadedPdf
  pageNumber: number
  pageCount: number
  scale: number
  visible: boolean
  // Size to lay the page out at until it has been drawn once (PDF points).
  placeholderSize: PageSize
  register: (pageNumber: number, element: HTMLElement | null) => void
}

const RenderingOverlay = () => {
  const theme = useTheme()
  return (
    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <CircularProgress size={18} />
      <Typography color={theme.palette.text.secondary} variant="caption">
        {PDF_RENDERING_LABEL}
      </Typography>
    </Box>
  )
}

/**
 * One page of the scrolling viewer. Its box is always laid out, so the scrollbar reflects the whole
 * document; the canvas inside exists only while the page is in or near view.
 */
const PdfPage = ({ pdf, pageNumber, pageCount, scale, visible, placeholderSize, register }: PdfPageProps) => {
  const theme = useTheme()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // This page's own size once drawn. Pages can differ from page 1, and a page that leaves the view
  // must keep its place, or everything below it would jump.
  const [ownSize, setOwnSize] = useState<PageSize | null>(null)
  const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!visible || !canvas) return undefined

    // Aborted when the page leaves the view, the zoom changes or the document goes away. pdf.js then
    // stops drawing and frees the canvas for the next render.
    const controller = new AbortController()
    setIsRendering(true)
    void pdf
      .renderPage(pageNumber, canvas, { scale, signal: controller.signal })
      .then((size) => {
        if (size && !controller.signal.aborted) setOwnSize(size)
      })
      .catch(() => {
        // A single unrenderable page should not blank the whole preview; the page just stays empty.
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsRendering(false)
      })

    return () => controller.abort()
  }, [pdf, pageNumber, scale, visible])

  // WebKit can keep a canvas's bitmap alive after the element is gone. Shrinking it first releases
  // the memory, which matters on a phone scrolling through a long document.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!visible || !canvas) return undefined
    return () => {
      canvas.width = 0
      canvas.height = 0
    }
  }, [visible])

  const setElement = useCallback((element: HTMLElement | null) => register(pageNumber, element), [register, pageNumber])
  const size = ownSize ?? placeholderSize

  return (
    <Box
      ref={setElement}
      aria-label={PDF_PAGE_POSITION(pageNumber, pageCount)}
      data-page={pageNumber}
      role="img"
      style={{ width: `${Math.round(size.width * scale)}px`, height: `${Math.round(size.height * scale)}px` }}
      sx={{
        position: 'relative',
        flex: 'none',
        overflow: 'hidden',
        borderRadius: 0.5,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1]
      }}>
      {visible && <Box component="canvas" ref={canvasRef} sx={{ display: 'block' }} />}
      {visible && isRendering && <RenderingOverlay />}
    </Box>
  )
}

/**
 * Shows a PDF in a tall frame with every page stacked and scrolling, plus zoom controls. pdf.js
 * paints each page onto a canvas: nothing from the document itself ever executes, and it never
 * reaches an iframe or a browser plugin.
 *
 * Only pages in or near view are drawn, and a page that scrolls away drops its canvas again. A
 * 50-page document drawn all at once would hold several hundred megabytes of bitmaps.
 */
export const PdfPreview = ({ bytes, onUnreadable, onPageCount }: PdfPreviewProps) => {
  const theme = useTheme()
  const frameRef = useRef<HTMLDivElement | null>(null)
  const [pdf, setPdf] = useState<LoadedPdf | null>(null)
  const [unreadable, setUnreadable] = useState(false)
  // The scale that fits page 1's width to the frame; null until the frame has been measured, so
  // nothing is drawn at a scale that is about to change.
  const [fitScale, setFitScale] = useState<number | null>(null)
  // A scale the user zoomed to. null means "Fit width": follow the frame.
  const [zoom, setZoom] = useState<number | null>(null)
  const [visiblePages, setVisiblePages] = useState<ReadonlySet<number>>(() => new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const pageElements = useRef(new Map<number, HTMLElement>())

  const scale = zoom ?? fitScale
  // Without IntersectionObserver (old browsers, jsdom) every page is drawn.
  const tracksVisibility = typeof IntersectionObserver !== 'undefined'

  useEffect(() => {
    let cancelled = false
    let loaded: LoadedPdf | null = null
    // A new file starts from scratch: nothing of the previous document's layout or zoom carries over.
    setPdf(null)
    setUnreadable(false)
    setFitScale(null)
    setZoom(null)
    setVisiblePages(new Set())

    void loadPdf(bytes).then((result) => {
      // The effect can be torn down mid-parse (navigation, a new decrypt); dropping the result
      // keeps a stale document from replacing the current one.
      if (cancelled) {
        result?.destroy()
        return
      }
      if (!result) {
        setUnreadable(true)
        onUnreadable()
        return
      }
      loaded = result
      setPdf(result)
      onPageCount?.(result.pageCount)
    })

    return () => {
      cancelled = true
      loaded?.destroy()
    }
  }, [bytes, onUnreadable, onPageCount])

  // Measured before paint, so the first pages are drawn at the fitted scale. Re-measured when the
  // window resizes; that only changes what is drawn while the user has not zoomed.
  useLayoutEffect(() => {
    if (!pdf) return undefined
    const measure = () => {
      const pageWidth = pdf.firstPageSize?.width
      setFitScale(pageWidth === undefined ? 1 : fitScaleFor(frameRef.current?.clientWidth ?? 0, pageWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [pdf])

  useEffect(() => {
    const frame = frameRef.current
    if (!pdf || !frame || !tracksVisibility) return undefined

    // disconnect() does not drop entries already queued; those would mark pages of the next
    // document visible, since page numbers repeat across documents.
    let disposed = false
    const observer = new IntersectionObserver(
      (entries) => {
        if (disposed) return
        setVisiblePages((current) => {
          const next = new Set(current)
          for (const entry of entries) {
            const page = Number((entry.target as HTMLElement).dataset.page)
            if (entry.isIntersecting) next.add(page)
            else next.delete(page)
          }
          return next
        })
      },
      // One frame height above and below the visible area: a page is drawn just before it scrolls in.
      { root: frame, rootMargin: '100% 0px' }
    )
    pageElements.current.forEach((element) => observer.observe(element))
    observerRef.current = observer

    return () => {
      disposed = true
      observer.disconnect()
      observerRef.current = null
    }
  }, [pdf, tracksVisibility])

  const registerPage = useCallback((pageNumber: number, element: HTMLElement | null) => {
    const previous = pageElements.current.get(pageNumber)
    if (previous) observerRef.current?.unobserve(previous)
    if (element) {
      pageElements.current.set(pageNumber, element)
      observerRef.current?.observe(element)
    } else {
      pageElements.current.delete(pageNumber)
    }
  }, [])

  if (unreadable) return null

  const pageCount = pdf?.pageCount ?? 0
  const placeholderSize = pdf?.firstPageSize ?? DEFAULT_PAGE_SIZE

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Stack alignItems="center" direction="row" gap={0.5} justifyContent="center">
        <IconButton
          aria-label={PDF_ZOOM_OUT_LABEL}
          disabled={scale === null || scale <= MIN_SCALE}
          size="small"
          onClick={() => scale !== null && setZoom(zoomOut(scale))}>
          <SearchZoomOut size={18} color="currentColor" />
        </IconButton>
        <Typography color={theme.palette.text.secondary} sx={{ minWidth: 48, textAlign: 'center' }} variant="caption">
          {scale === null ? '' : zoomPercent(scale)}
        </Typography>
        <IconButton
          aria-label={PDF_ZOOM_IN_LABEL}
          disabled={scale === null || scale >= MAX_SCALE}
          size="small"
          onClick={() => scale !== null && setZoom(zoomIn(scale))}>
          <SearchZoomIn size={18} color="currentColor" />
        </IconButton>
        <Button aria-pressed={zoom === null} disabled={scale === null} size="small" variant={zoom === null ? 'outlined' : 'text'} onClick={() => setZoom(null)}>
          {PDF_FIT_WIDTH_LABEL}
        </Button>
      </Stack>

      <Box
        ref={frameRef}
        aria-label={PDF_VIEWER_LABEL}
        role="region"
        tabIndex={0}
        sx={{
          position: 'relative',
          height: '75vh',
          // Always-present vertical scrollbar: "Fit width" measures the same width before and after
          // the pages appear, so it never opens with a horizontal scrollbar.
          overflowY: 'scroll',
          overflowX: 'auto',
          px: `${FRAME_PADDING_PX}px`,
          py: 2,
          borderRadius: 1,
          backgroundColor: theme.palette.action.hover
        }}>
        {/* At least as wide as the frame, so narrow pages are centred; as wide as the widest page
            once zoomed, so the frame scrolls sideways instead of cutting the page off. */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 'max-content', minWidth: '100%' }}>
          {pdf &&
            scale !== null &&
            Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <PdfPage
                key={pageNumber}
                pageCount={pageCount}
                pageNumber={pageNumber}
                pdf={pdf}
                placeholderSize={placeholderSize}
                register={registerPage}
                scale={scale}
                visible={!tracksVisibility || visiblePages.has(pageNumber)}
              />
            ))}
        </Box>
        {!pdf && <RenderingOverlay />}
      </Box>
    </Box>
  )
}
