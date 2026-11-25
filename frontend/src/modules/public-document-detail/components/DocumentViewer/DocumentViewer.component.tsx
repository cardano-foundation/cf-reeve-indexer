import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Document as IconDocument, DocumentDownload, DocumentText, Gallery } from 'iconsax-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { PdfPreview } from 'modules/public-document-detail/components/PdfPreview/PdfPreview.component'
import {
  DECRYPT_DOWNLOAD_BUTTON_LABEL,
  DECRYPT_VIEWER_BINARY_MESSAGE,
  DECRYPT_VIEWER_IMAGE_ALT,
  DECRYPT_VIEWER_KIND_LABELS,
  DECRYPT_VIEWER_PDF_UNREADABLE_MESSAGE,
  DECRYPT_VIEWER_TITLE,
  DECRYPT_VIEWER_UNVERIFIED_MESSAGE,
  PDF_PAGE_COUNT
} from 'modules/public-document-detail/constants/detail.consts.ts'
import { detectContent } from 'modules/public-document-detail/utils/content.ts'

type DocumentViewerProps = {
  bytes: Uint8Array
  // Only content whose SHA-256 matches the on-chain plaintext hash is previewed inline. Bytes that
  // do not match are never rendered — a substituted document must not reach a renderer at all — but
  // the header still offers a download so they can be inspected deliberately.
  plaintextHashMatches: boolean
  onDownload?: () => void
}

const KIND_ICON = {
  image: Gallery,
  pdf: DocumentText,
  text: DocumentText,
  json: DocumentText,
  binary: IconDocument
} as const

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(1)} ${units[unit]}`
}

/**
 * Previews decrypted document bytes in the browser. Everything happens locally — nothing is uploaded.
 *
 * Content is classified by magic bytes and UTF-8 shape rather than by a filename, because there is no
 * filename: the original is personally identifying and never leaves the publishing system. Images,
 * text and JSON render directly; PDFs are parsed by pdf.js and painted onto a canvas. Anything that
 * cannot be rendered — an unrecognised format, or a PDF that will not parse — falls back to a
 * download, which is always available regardless of what the preview manages to show.
 */
export const DocumentViewer = ({ bytes, plaintextHashMatches, onDownload }: DocumentViewerProps) => {
  const theme = useTheme()
  const content = useMemo(() => detectContent(bytes), [bytes])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [pdfUnreadable, setPdfUnreadable] = useState(false)
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null)

  // A new file replaces whatever the previous one reported.
  useEffect(() => {
    setPdfUnreadable(false)
    setPdfPageCount(null)
  }, [bytes])

  useEffect(() => {
    // A blob URL is only ever built for verified image bytes; PDFs go through pdf.js instead.
    if (!plaintextHashMatches || content.kind !== 'image') {
      setImageUrl(null)
      return undefined
    }
    // Copy into a fresh ArrayBuffer-backed view: Blob wants Uint8Array<ArrayBuffer> (TS 5.7+ typing).
    const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: content.mediaType }))
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [content, bytes, plaintextHashMatches])

  // Stable identities: PdfPreview takes both as effect dependencies, so inline closures would
  // restart the parse on every render.
  const handleUnreadable = useCallback(() => setPdfUnreadable(true), [])
  const handlePageCount = useCallback((count: number) => setPdfPageCount(count), [])

  const KindIcon = plaintextHashMatches ? KIND_ICON[content.kind] : IconDocument
  const showsPdf = plaintextHashMatches && content.kind === 'pdf' && !pdfUnreadable

  const preBoxSx = {
    m: 0,
    p: 1.5,
    maxHeight: 480,
    overflow: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const
  }

  return (
    <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', backgroundColor: theme.palette.background.paper }}>
      <Stack
        alignItems="center"
        direction="row"
        gap={1.5}
        sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.action.hover }}>
        <KindIcon size={20} color={theme.palette.text.secondary} variant="Bold" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap variant="subtitle2">
            {DECRYPT_VIEWER_TITLE}
          </Typography>
          <Typography color={theme.palette.text.secondary} variant="caption">
            {formatBytes(bytes.length)}
            {showsPdf && pdfPageCount !== null && ` · ${PDF_PAGE_COUNT(pdfPageCount)}`}
          </Typography>
        </Box>
        {plaintextHashMatches && <Chip color="default" label={DECRYPT_VIEWER_KIND_LABELS[content.kind]} size="small" />}
        {onDownload && (
          <Button size="small" startIcon={<DocumentDownload size={16} color="currentColor" />} variant="outlined" onClick={onDownload}>
            {DECRYPT_DOWNLOAD_BUTTON_LABEL}
          </Button>
        )}
      </Stack>

      <Fade in timeout={350}>
        <Box sx={{ p: 1.5 }}>
          {!plaintextHashMatches ? (
            <Typography color={theme.palette.text.secondary} variant="body2">
              {DECRYPT_VIEWER_UNVERIFIED_MESSAGE}
            </Typography>
          ) : (
            <>
              {content.kind === 'image' && imageUrl && (
                <Box
                  component="img"
                  alt={DECRYPT_VIEWER_IMAGE_ALT}
                  src={imageUrl}
                  sx={{ display: 'block', maxWidth: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 1 }}
                />
              )}

              {(content.kind === 'text' || content.kind === 'json') && <Box component="pre" sx={preBoxSx}>{content.text}</Box>}

              {showsPdf && <PdfPreview bytes={bytes} onPageCount={handlePageCount} onUnreadable={handleUnreadable} />}

              {content.kind === 'pdf' && pdfUnreadable && (
                <Typography color={theme.palette.text.secondary} variant="body2">
                  {DECRYPT_VIEWER_PDF_UNREADABLE_MESSAGE}
                </Typography>
              )}

              {content.kind === 'binary' && (
                <Typography color={theme.palette.text.secondary} variant="body2">
                  {DECRYPT_VIEWER_BINARY_MESSAGE}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Fade>
    </Box>
  )
}
