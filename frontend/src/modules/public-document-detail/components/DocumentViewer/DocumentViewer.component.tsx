import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Document as IconDocument, DocumentDownload, DocumentText, Gallery } from 'iconsax-react'
import { useEffect, useMemo, useState } from 'react'

import {
  DECRYPT_DOWNLOAD_BUTTON_LABEL,
  DECRYPT_VIEWER_BINARY_MESSAGE,
  DECRYPT_VIEWER_IMAGE_ALT,
  DECRYPT_VIEWER_KIND_LABELS,
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
  // PDF/image renderer) — the header still offers a download so the user can inspect them deliberately.
  plaintextHashMatches: boolean
  // Hands the (verified or unverified) bytes to the panel's download flow. Hosted in the header so a
  // download is one click away in every state, matching the platform document viewer.
  onDownload?: () => void
}

// Icon per detected kind (there is no filename to name the file — I10 — so the icon + chip state the
// detected content KIND instead). text/json/pdf are document-shaped; images get the gallery glyph.
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
 * In-browser preview of DECRYPTED document bytes (§ document viewer). Everything renders locally
 * from a blob URL — nothing is uploaded. Content is classified by magic bytes / UTF-8 shape
 * (utils/content.ts), never by a filename (there is none: I10). Images and text/JSON preview
 * inline; a PDF renders in the browser's own viewer, inside a fully-locked-down sandboxed iframe,
 * only after an explicit click; anything we can't render safely (or that failed hash verification)
 * falls back to the header's download button.
 *
 * The chrome (card + header with a kind icon, size, kind chip, and download) mirrors the platform's
 * document viewer; the SAFETY posture is deliberately the Indexer's own and is NOT relaxed to match:
 * magic-byte classification (no filename to trust), plaintext-hash gating before any render, and a
 * maximally-restrictive PDF sandbox — these bytes are public and may be attacker-authored.
 */
export const DocumentViewer = ({ bytes, plaintextHashMatches, onDownload }: DocumentViewerProps) => {
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

  const KindIcon = plaintextHashMatches ? KIND_ICON[content.kind] : IconDocument

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
              {content.kind === 'image' && objectUrl && (
                <Box
                  component="img"
                  alt={DECRYPT_VIEWER_IMAGE_ALT}
                  src={objectUrl}
                  sx={{ display: 'block', maxWidth: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 1 }}
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
