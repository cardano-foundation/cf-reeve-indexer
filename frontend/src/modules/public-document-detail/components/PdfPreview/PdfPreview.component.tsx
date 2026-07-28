import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react'
import { useEffect, useRef, useState } from 'react'

import {
  PDF_NEXT_PAGE_LABEL,
  PDF_PAGE_POSITION,
  PDF_PREVIOUS_PAGE_LABEL,
  PDF_RENDERING_LABEL
} from 'modules/public-document-detail/constants/detail.consts.ts'
import { loadPdf, type LoadedPdf } from 'modules/public-document-detail/utils/pdf.ts'

type PdfPreviewProps = {
  bytes: Uint8Array
  // Called when the bytes start with "%PDF" but will not parse. The parent swaps to its
  // download-only fallback rather than leaving an empty frame on screen.
  onUnreadable: () => void
  // Reports the page count up so the viewer header can show it alongside the file size.
  onPageCount?: (pageCount: number) => void
}

/** Renders a PDF page-by-page onto a canvas. Nothing from the document itself ever executes. */
export const PdfPreview = ({ bytes, onUnreadable, onPageCount }: PdfPreviewProps) => {
  const theme = useTheme()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [pdf, setPdf] = useState<LoadedPdf | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [isRendering, setIsRendering] = useState(true)

  useEffect(() => {
    let cancelled = false
    let loaded: LoadedPdf | null = null

    void loadPdf(bytes).then((result) => {
      // The effect can be torn down mid-parse (navigation, a new decrypt); dropping the result
      // keeps a stale document from replacing the current one.
      if (cancelled) {
        result?.destroy()
        return
      }
      if (!result) {
        setIsRendering(false)
        onUnreadable()
        return
      }
      loaded = result
      setPdf(result)
      setPageNumber(1)
      onPageCount?.(result.pageCount)
    })

    return () => {
      cancelled = true
      loaded?.destroy()
    }
  }, [bytes, onUnreadable, onPageCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!pdf || !canvas) return undefined

    let cancelled = false
    setIsRendering(true)
    void pdf
      .renderPage(pageNumber, canvas)
      .catch(() => {
        // A single unrenderable page should not blank the whole preview; the page just stays empty.
      })
      .finally(() => {
        if (!cancelled) setIsRendering(false)
      })

    return () => {
      cancelled = true
    }
  }, [pdf, pageNumber])

  const pageCount = pdf?.pageCount ?? 0
  const hasPages = pageCount > 1

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          p: 1,
          borderRadius: 1,
          minHeight: 200,
          backgroundColor: theme.palette.action.hover
        }}>
        <Box component="canvas" ref={canvasRef} sx={{ maxWidth: '100%', borderRadius: 0.5, boxShadow: theme.shadows[1] }} />
        {isRendering && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CircularProgress size={18} />
            <Typography color={theme.palette.text.secondary} variant="caption">
              {PDF_RENDERING_LABEL}
            </Typography>
          </Box>
        )}
      </Box>

      {hasPages && (
        <Box alignItems="center" display="flex" gap={1} justifyContent="center">
          <IconButton
            aria-label={PDF_PREVIOUS_PAGE_LABEL}
            disabled={pageNumber <= 1}
            size="small"
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}>
            <ArrowLeft2 size={16} color="currentColor" />
          </IconButton>
          <Typography color={theme.palette.text.secondary} variant="caption">
            {PDF_PAGE_POSITION(pageNumber, pageCount)}
          </Typography>
          <IconButton
            aria-label={PDF_NEXT_PAGE_LABEL}
            disabled={pageNumber >= pageCount}
            size="small"
            onClick={() => setPageNumber((page) => Math.min(pageCount, page + 1))}>
            <ArrowRight2 size={16} color="currentColor" />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}
