import { Alert, Box, Button, Chip, TextField, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material'
import { useState } from 'react'


import { deriveCardKeyFromExistingPasskey, isPasskeySupported } from 'libs/document-vault-crypto/passkey'
import { PUBLIC_KEY_HEX_REGEX, hashPublicKey } from 'libs/document-vault-crypto/recipientKeyHash'
import {
  MY_DOCUMENTS_ACTIVE_PREFIX,
  MY_DOCUMENTS_FILTER_BUTTON_LABEL,
  MY_DOCUMENTS_FILTER_CANCEL_LABEL,
  MY_DOCUMENTS_FILTER_CLEAR_LABEL,
  MY_DOCUMENTS_INVALID_KEY_MESSAGE,
  MY_DOCUMENTS_PASSKEY_DESCRIPTION,
  MY_DOCUMENTS_PASSKEY_FAILED_MESSAGE,
  MY_DOCUMENTS_PASSKEY_UNLOCK_BUTTON_LABEL,
  MY_DOCUMENTS_PASSKEY_UNSUPPORTED_MESSAGE,
  MY_DOCUMENTS_RAW_KEY_LABEL,
  MY_DOCUMENTS_SOURCE_PASSKEY,
  MY_DOCUMENTS_SOURCE_RAW,
  MY_DOCUMENTS_SOURCE_SELECTOR_LABEL,
  MY_DOCUMENTS_USE_KEY_BUTTON_LABEL
} from 'modules/public-documents/constants/documents.consts'

type Props = {
  recipientKeyHash: string | null
  onRecipientKeyHashChange: (hash: string | null) => void
}

type KeySource = 'passkey' | 'raw'

/**
 * Lets a recipient narrow the public list to documents addressed to them. Mirrors DecryptPanel's
 * passkey|raw source toggle deliberately — it is the same choice users already know from decrypting.
 *
 * The crucial difference from DecryptPanel: this only ever handles the PUBLIC key. The passkey path
 * calls deriveCardKeyFromExistingPasskey, which returns the public half alone and zeroes the PRF
 * output, and the text field asks for a public key — so nothing secret is typed, held or sent. The
 * resulting hash lives in React state only and is gone on reload.
 */
export const MyDocumentsFilter = ({ recipientKeyHash, onRecipientKeyHashChange }: Props) => {
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [source, setSource] = useState<KeySource>('passkey')
  const [rawKeyInput, setRawKeyInput] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const apply = async (publicKeyHex: string) => {
    onRecipientKeyHashChange(await hashPublicKey(publicKeyHex))
    setIsOpen(false)
    setRawKeyInput('')
    setErrorMessage(null)
  }

  const handleUnlockPasskey = async () => {
    setErrorMessage(null)
    if (!isPasskeySupported()) {
      setErrorMessage(MY_DOCUMENTS_PASSKEY_UNSUPPORTED_MESSAGE)
      setSource('raw')

      return
    }
    setIsBusy(true)
    try {
      const { publicKeyHex } = await deriveCardKeyFromExistingPasskey()
      await apply(publicKeyHex)
    } catch {
      // A cancelled prompt, an authenticator without PRF support, and no matching credential all land
      // here, and all have the same remedy: paste the public key instead.
      setErrorMessage(MY_DOCUMENTS_PASSKEY_FAILED_MESSAGE)
    } finally {
      setIsBusy(false)
    }
  }

  const handleUseRawKey = async () => {
    setErrorMessage(null)
    const candidate = rawKeyInput.trim()
    if (!PUBLIC_KEY_HEX_REGEX.test(candidate)) {
      setErrorMessage(MY_DOCUMENTS_INVALID_KEY_MESSAGE)

      return
    }
    setIsBusy(true)
    try {
      await apply(candidate)
    } catch {
      setErrorMessage(MY_DOCUMENTS_INVALID_KEY_MESSAGE)
    } finally {
      setIsBusy(false)
    }
  }

  if (recipientKeyHash) {
    return (
      <Box alignItems="center" display="flex" flexWrap="wrap" gap={1}>
        <Chip
          label={`${MY_DOCUMENTS_ACTIVE_PREFIX} ${recipientKeyHash.slice(0, 8)}…${recipientKeyHash.slice(-8)}`}
          variant="outlined"
        />
        <Button size="small" onClick={() => onRecipientKeyHashChange(null)}>
          {MY_DOCUMENTS_FILTER_CLEAR_LABEL}
        </Button>
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box>
        <Button variant="outlined" onClick={() => setIsOpen((open) => !open)}>
          {isOpen ? MY_DOCUMENTS_FILTER_CANCEL_LABEL : MY_DOCUMENTS_FILTER_BUTTON_LABEL}
        </Button>
      </Box>

      {isOpen && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={0.75}>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {MY_DOCUMENTS_SOURCE_SELECTOR_LABEL}
            </Typography>
            <ToggleButtonGroup
              aria-label={MY_DOCUMENTS_SOURCE_SELECTOR_LABEL}
              color="primary"
              disabled={isBusy}
              exclusive
              size="small"
              value={source}
              onChange={(_, value: KeySource | null) => value && setSource(value)}>
              <ToggleButton value="passkey">{MY_DOCUMENTS_SOURCE_PASSKEY}</ToggleButton>
              <ToggleButton value="raw">{MY_DOCUMENTS_SOURCE_RAW}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {source === 'passkey' && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography color={theme.palette.text.secondary} variant="body2">
                {MY_DOCUMENTS_PASSKEY_DESCRIPTION}
              </Typography>
              <Box>
                <Button disabled={isBusy} variant="contained" onClick={() => void handleUnlockPasskey()}>
                  {MY_DOCUMENTS_PASSKEY_UNLOCK_BUTTON_LABEL}
                </Button>
              </Box>
            </Box>
          )}

          {source === 'raw' && (
            <Box alignItems="center" display="flex" gap={1}>
              <TextField
                autoComplete="off"
                fullWidth
                label={MY_DOCUMENTS_RAW_KEY_LABEL}
                size="small"
                value={rawKeyInput}
                onChange={(event) => setRawKeyInput(event.target.value)}
              />
              <Button disabled={!rawKeyInput || isBusy} variant="outlined" onClick={() => void handleUseRawKey()}>
                {MY_DOCUMENTS_USE_KEY_BUTTON_LABEL}
              </Button>
            </Box>
          )}

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </Box>
      )}
    </Box>
  )
}
