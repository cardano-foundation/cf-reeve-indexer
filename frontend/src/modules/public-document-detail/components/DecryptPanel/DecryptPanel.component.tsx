import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { Key } from 'iconsax-react'
import { useLayoutEffect, useState } from 'react'

import type { DocumentVerdict, DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import { useGetDocumentEnvelopeModel } from 'libs/models/documents-model/GetDocumentEnvelope/GetDocumentEnvelope.service.ts'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import type { DecryptAvailability } from 'modules/public-document-detail/components/DecryptPanel/DecryptPanel.hooks.ts'
import { useDecryptPanel } from 'modules/public-document-detail/components/DecryptPanel/DecryptPanel.hooks.ts'
import { DocumentViewer } from 'modules/public-document-detail/components/DocumentViewer/DocumentViewer.component.tsx'
import {
  DECRYPT_DECRYPTING_LABEL,
  DECRYPT_IPFS_RETRYING_MESSAGE,
  DECRYPT_MATCH_MESSAGE,
  DECRYPT_MISMATCH_MESSAGE,
  DECRYPT_PANEL_DESCRIPTION,
  DECRYPT_PANEL_TITLE,
  DECRYPT_PASSKEY_DESCRIPTION,
  DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL,
  DECRYPT_PENDING_MESSAGE,
  DECRYPT_RAW_KEY_LABEL,
  DECRYPT_RESET_BUTTON_LABEL,
  DECRYPT_SOURCE_PASSKEY,
  DECRYPT_SOURCE_RAW,
  DECRYPT_SOURCE_SELECTOR_LABEL,
  DECRYPT_UNAVAILABLE_MESSAGE,
  DECRYPT_USE_KEY_BUTTON_LABEL
} from 'modules/public-document-detail/constants/detail.consts.ts'
import { saveDecryptedFile } from 'modules/public-document-detail/utils/download.ts'

type DecryptPanelProps = {
  anchor: DocumentView
  documentId: string
}

type KeySource = 'passkey' | 'raw'

// Availability decides whether the key form works; the verdict picks the explanation, because
// PENDING and IPFS_UNAVAILABLE are both "not yet", for different reasons.
const lockedNoteFor = (verdict: DocumentVerdict, availability: DecryptAvailability) => {
  if (availability === 'available') return null
  if (availability === 'unavailable') return { severity: 'warning', message: DECRYPT_UNAVAILABLE_MESSAGE } as const
  return { severity: 'info', message: verdict === 'IPFS_UNAVAILABLE' ? DECRYPT_IPFS_RETRYING_MESSAGE : DECRYPT_PENDING_MESSAGE } as const
}

/**
 * In-browser decrypt panel. All crypto and the private key itself stay client-side
 * (`useDecryptPanel`); the only network call this component triggers is the envelope fetch via the
 * public proxy. It starts in the same click that presents a key ("Use this key", or a successful
 * passkey unlock) — there is no separate Decrypt step, and nothing is fetched on mount.
 *
 * The key is supplied one of two ways, chosen with the source selector: re-derived from the
 * holder's passkey (the primary, permissionless path — no uploaded record), or a raw hex key
 * (fallback). On success the decrypted bytes preview in-browser via {@link DocumentViewer}.
 */
export const DecryptPanel = ({ anchor, documentId }: DecryptPanelProps) => {
  const theme = useTheme()
  const { fetchEnvelope } = useGetDocumentEnvelopeModel()

  const { availability, status, errorMessage, outcome, setRawKey, unlockWithPasskey, decrypt, reset } = useDecryptPanel({
    anchor,
    deps: { fetchEnvelope }
  })

  const [source, setSource] = useState<KeySource>('passkey')
  const [rawKeyInput, setRawKeyInput] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  const isAvailable = availability === 'available'
  const lockedNote = lockedNoteFor(anchor.verdict, availability)
  const isBusy = status === 'decrypting'

  // The panel is not remounted when another anchor is picked. A key typed but not yet handed to the
  // hook must not follow the user there — least of all into a field that is now disabled.
  useLayoutEffect(() => {
    setRawKeyInput('')
  }, [anchor.tx_hash, availability])
  const isKeyInputVisible = status !== 'success'

  const handleSourceChange = (_event: React.MouseEvent<HTMLElement>, next: KeySource | null) => {
    if (!next || next === source) return
    // Switching input methods discards any staged key material and errors: the hook's
    // reset() clears the key ref and status back to idle.
    setSource(next)
    setRawKeyInput('')
    reset()
  }

  const handleUnlockPasskey = async () => {
    // Guard against a double-click firing two overlapping navigator.credentials.get() assertions.
    // setUnlocking is synchronous, so the WebAuthn call inside unlockWithPasskey is still the first
    // await in the user gesture.
    if (unlocking) return
    setUnlocking(true)
    try {
      await unlockWithPasskey()
    } finally {
      // Only the passkey prompt holds this lock. While decrypting, the controls are disabled by the
      // decrypting status instead, which another anchor resets; this flag would outlive the switch.
      setUnlocking(false)
    }
    // Presenting the key is the request to open the document. decrypt() does nothing if the
    // unlock failed, or if the anchor changed while the passkey prompt was open.
    await decrypt()
  }

  const handleUseRawKey = () => {
    setRawKey(rawKeyInput)
    // Clear the component-level copy the instant it's handed to the hook — the hook's
    // own privateKeysRef is the sole surviving copy from here on, cleared after every decrypt / unmount.
    setRawKeyInput('')
    // Straight on to the decrypt; a malformed key was rejected above and leaves nothing to try.
    void decrypt()
  }

  const handleReset = () => {
    setRawKeyInput('')
    reset()
  }

  const handleDownload = () => {
    if (!outcome) return
    saveDecryptedFile(documentId, outcome)
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box>
        <Typography variant="subtitle1">{DECRYPT_PANEL_TITLE}</Typography>
        <Typography color={theme.palette.text.secondary} variant="body2">
          {DECRYPT_PANEL_DESCRIPTION}
        </Typography>
      </Box>

      {lockedNote && <Alert severity={lockedNote.severity}>{lockedNote.message}</Alert>}

      {isKeyInputVisible && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={0.75}>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {DECRYPT_SOURCE_SELECTOR_LABEL}
            </Typography>
            <ToggleButtonGroup
              aria-label={DECRYPT_SOURCE_SELECTOR_LABEL}
              color="primary"
              disabled={isBusy || !isAvailable}
              exclusive
              size="small"
              value={source}
              onChange={handleSourceChange}>
              <ToggleButton value="passkey">{DECRYPT_SOURCE_PASSKEY}</ToggleButton>
              <ToggleButton value="raw">{DECRYPT_SOURCE_RAW}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {source === 'passkey' && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography color={theme.palette.text.secondary} variant="body2">
                {DECRYPT_PASSKEY_DESCRIPTION}
              </Typography>
              <Box>
                <Button
                  disabled={isBusy || unlocking || !isAvailable}
                  startIcon={<Key size={18} variant="Outline" />}
                  variant="contained"
                  onClick={() => void handleUnlockPasskey()}>
                  {DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL}
                </Button>
              </Box>
            </Box>
          )}

          {source === 'raw' && (
            <Box alignItems="center" display="flex" gap={1}>
              <TextField
                autoComplete="off"
                disabled={isBusy || !isAvailable}
                fullWidth
                label={DECRYPT_RAW_KEY_LABEL}
                size="small"
                type="password"
                value={rawKeyInput}
                onChange={(event) => setRawKeyInput(event.target.value)}
              />
              <Button disabled={!rawKeyInput || isBusy || !isAvailable} variant="outlined" onClick={handleUseRawKey}>
                {DECRYPT_USE_KEY_BUTTON_LABEL}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {isBusy && (
        <Box alignItems="center" display="flex" gap={1} role="status">
          <CircularProgress size={16} />
          <Typography color={theme.palette.text.secondary} variant="body2">
            {DECRYPT_DECRYPTING_LABEL}
          </Typography>
        </Box>
      )}

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {status === 'success' && outcome && (
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Alert severity={outcome.plaintextHashMatches ? 'success' : 'error'}>
            {outcome.plaintextHashMatches ? DECRYPT_MATCH_MESSAGE : DECRYPT_MISMATCH_MESSAGE}
          </Alert>
          <DocumentViewer bytes={outcome.plaintext} plaintextHashMatches={outcome.plaintextHashMatches} onDownload={handleDownload} />
          <Box>
            <Button variant="text" onClick={handleReset}>
              {DECRYPT_RESET_BUTTON_LABEL}
            </Button>
          </Box>
        </Box>
      )}

      {status === 'failure' && (
        <Box>
          <Button variant="text" onClick={handleReset}>
            {DECRYPT_RESET_BUTTON_LABEL}
          </Button>
        </Box>
      )}
    </Box>
  )
}
