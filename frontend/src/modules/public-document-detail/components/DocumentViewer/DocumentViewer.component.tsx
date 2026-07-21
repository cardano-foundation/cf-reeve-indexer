import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'

import {
  DECRYPT_VIEWER_BINARY_MESSAGE,
  DECRYPT_VIEWER_IMAGE_ALT,
  DECRYPT_VIEWER_PDF_HIDE,
  DECRYPT_VIEWER_PDF_SHOW,
  DECRYPT_VIEWER_TITLE,
  DECRYPT_VIEWER_UNVERIFIED_MESSAGE
} from 'modules/public-document-detail/constants/detail.consts.ts'
import { detectContent } from 'modules/public-document-detail/utils/content.ts'

type DocumentViewerProps = {
  bytes: Uint8Array
  // Only content whose SHA-256 matches the on-chain plaintext hash is previewed inline. Bytes that
  // do not match are never rendered (a substituted/hostile document must not reach the browser's
  // PDF/image renderer) — the panel still offers a download so the user can inspect them deliberately.
  plaintextHashMatches: boolean
}

/**
 * In-browser preview of DECRYPTED document bytes (§ document viewer). Everything renders locally
 * from a blob URL — nothing is uploaded. Content is classified by magic bytes / UTF-8 shape
 * (utils/content.ts), never by a filename (there is none: I10). Images and text/JSON preview
 * inline; a PDF renders in the browser's own viewer, inside a fully-locked-down sandboxed iframe,
 * only after an explicit click; anything we can't render safely (or that failed hash verification)
 * falls back to the download button the panel already provides.
 */
export const DocumentViewer = ({ bytes, plaintextHashMatches }: DocumentViewerProps) => {
  const theme = useTheme()
  const content = useMemo(() => detectContent(bytes), [bytes])
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [pdfVisible, setPdfVisible] = useState(false)

  useEffect(() => {
    // Never build a renderable URL for unverified bytes, nor for non-previewable kinds.
    if (!plaintextHashMatches || (content.kind !== 'pdf' && content.kind !== 'image')) {
      setObjectUrl(null)
      return undefined
    }
    const mediaType = content.kind === 'pdf' ? 'application/pdf' : content.mediaType
    // Copy into a fresh ArrayBuffer-backed view: Blob wants Uint8Array<ArrayBuffer> (TS 5.7+ typing).
    const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: mediaType }))
    setObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [content, bytes, plaintextHashMatches])

  if (!plaintextHashMatches) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 1, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.action.hover }}>
        <Typography color={theme.palette.text.secondary} variant="body2">
          {DECRYPT_VIEWER_UNVERIFIED_MESSAGE}
        </Typography>
      </Box>
    )
  }

  const preBoxSx = {
    m: 0,
    p: 1.5,
    maxHeight: 480,
    overflow: 'auto',
    borderRadius: 1,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.action.hover,
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const
  }

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Typography variant="subtitle2">{DECRYPT_VIEWER_TITLE}</Typography>

      {content.kind === 'image' && objectUrl && (
        <Box
          component="img"
          alt={DECRYPT_VIEWER_IMAGE_ALT}
          src={objectUrl}
          sx={{ maxWidth: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}
        />
      )}

      {(content.kind === 'text' || content.kind === 'json') && <Box component="pre" sx={preBoxSx}>{content.text}</Box>}

      {content.kind === 'pdf' && (
        <Box display="flex" flexDirection="column" gap={1}>
          <Box>
            <Button variant="outlined" onClick={() => setPdfVisible((visible) => !visible)}>
              {pdfVisible ? DECRYPT_VIEWER_PDF_HIDE : DECRYPT_VIEWER_PDF_SHOW}
            </Button>
          </Box>
          {pdfVisible && objectUrl && (
            <Box
              component="iframe"
              // Maximally restrictive sandbox: no allow-scripts and no allow-same-origin, so even a
              // hostile PDF (these bytes may be attacker-authored, only encrypted TO the recipient)
              // renders in a fully isolated frame with no script execution and an opaque origin.
              sandbox=""
              src={objectUrl}
              title={DECRYPT_VIEWER_IMAGE_ALT}
              sx={{ width: '100%', height: 600, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}
            />
          )}
        </Box>
      )}

      {content.kind === 'binary' && (
        <Box sx={{ p: 1.5, borderRadius: 1, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.action.hover }}>
          <Typography color={theme.palette.text.secondary} variant="body2">
            {DECRYPT_VIEWER_BINARY_MESSAGE}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
