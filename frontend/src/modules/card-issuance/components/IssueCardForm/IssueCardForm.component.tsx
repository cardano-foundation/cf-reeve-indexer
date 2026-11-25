import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { FormEvent, MouseEvent, useState } from 'react'

import type { IssueSubject } from 'libs/document-vault-crypto/issue'
import { downloadCardFile } from 'libs/document-vault-crypto/issue'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { AttestCardWizard } from 'modules/card-issuance/components/AttestCardWizard/AttestCardWizard.component'
import type { PasskeyMode } from 'modules/card-issuance/components/IssueCardForm/IssueCardForm.hooks'
import { useIssueCardForm } from 'modules/card-issuance/components/IssueCardForm/IssueCardForm.hooks'
import type { IssueCardFields } from 'modules/card-issuance/components/IssueCardForm/IssueCardForm.validation'
import { validateFields } from 'modules/card-issuance/components/IssueCardForm/IssueCardForm.validation'
import {
  ATTEST_WIZARD_OPEN_LABEL,
  ATTEST_WIZARD_OPEN_NOTE
} from 'modules/card-issuance/constants/attestation.consts'
import {
  buildContactCardFileName,
  CONTACT_CARD_DOWNLOAD_LABEL,
  CONTACT_CARD_DOWNLOAD_NOTE,
  COPY_PUBLIC_KEY_DONE_LABEL,
  COPY_PUBLIC_KEY_LABEL,
  DERIVED_PUBLIC_KEY_LABEL,
  DISPLAY_NAME_LABEL,
  EMAIL_LABEL,
  ISSUE_ANOTHER_BUTTON_LABEL,
  ISSUE_BUTTON_LABEL,
  ISSUE_BUTTON_LABEL_EXISTING,
  ISSUE_CARD_FORM_TITLE,
  ISSUING_LABEL,
  ISSUING_LABEL_EXISTING,
  KEY_LABEL_LABEL,
  ORGANISATION_ID_LABEL,
  ORGANISATION_ID_OPTIONAL_GUIDANCE,
  PASSKEY_CARD_ISSUED_NOTE,
  PASSKEY_EXISTING_GUIDANCE,
  PASSKEY_ISSUANCE_GUIDANCE,
  PASSKEY_MODE_LABEL,
  PASSKEY_MODE_OPTIONS,
  SUBJECT_EXTERNAL_GUIDANCE
} from 'modules/card-issuance/constants/issuance.consts'

const initialFields: IssueCardFields = {
  displayName: '',
  email: '',
  organisationId: '',
  label: ''
}

/**
 * Card creation form — PERMISSIONLESS and fully client-side. The card is always for an EXTERNAL
 * holder whose subjectId is minted for them, so every field here is optional and only describes the
 * holder. A passkey is created/selected IN THIS BROWSER, the keypair is derived from it, and the
 * UNSIGNED card (public parts only) is assembled locally by `useIssueCardForm` — there is no login and
 * no network call. The private key is never rendered, copied, retained, or sent; it is re-derivable
 * only from the holder's passkey. The card is offered as a contact-card download.
 */
export const IssueCardForm = () => {
  const theme = useTheme()

  const { status, errorMessage, issuedCard, issue, reset } = useIssueCardForm()

  const [fields, setFields] = useState<IssueCardFields>(initialFields)
  const [passkeyMode, setPasskeyMode] = useState<PasskeyMode>('create')
  const [publicKeyCopied, setPublicKeyCopied] = useState(false)
  const [showAttestWizard, setShowAttestWizard] = useState(false)

  const isIssuing = status === 'issuing'
  const isIssued = status === 'issued'
  const isExistingMode = passkeyMode === 'existing'

  const errors = validateFields(fields)
  const canSubmit = Object.keys(errors).length === 0

  const setField = <K extends keyof IssueCardFields>(key: K, value: IssueCardFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const handlePasskeyModeChange = (_event: MouseEvent<HTMLElement>, next: PasskeyMode | null) => {
    // ToggleButtonGroup yields null when the active button is re-clicked; keep the current mode then.
    if (next) setPasskeyMode(next)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit || isIssuing) return

    const subject: IssueSubject = {
      ...(fields.organisationId ? { organisationId: fields.organisationId } : {}),
      ...(fields.displayName ? { displayName: fields.displayName } : {}),
      ...(fields.email ? { email: fields.email } : {})
    }

    await issue(subject, fields.label, passkeyMode)
  }

  const handleDownloadContactCard = () => {
    if (!issuedCard) return
    downloadCardFile(issuedCard, buildContactCardFileName(issuedCard.subject.subjectId))
  }

  // Copies the PUBLIC key only — it is safe to share and is all anyone needs to encrypt to the holder.
  const handleCopyPublicKey = async () => {
    if (!issuedCard) return
    await navigator.clipboard.writeText(issuedCard.key.publicKey)
    setPublicKeyCopied(true)
  }

  const handleIssueAnother = () => {
    reset()
    setFields(initialFields)
    setPublicKeyCopied(false)
    setShowAttestWizard(false)
  }

  return (
    <Box display="flex" flexDirection="column" gap={2} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2 }}>
      <Typography variant="subtitle1">{ISSUE_CARD_FORM_TITLE}</Typography>

      {!isIssued && (
        <Box component="form" display="flex" flexDirection="column" gap={2} onSubmit={(event) => void handleSubmit(event)}>
          <Typography color={theme.palette.text.secondary} variant="caption">
            {SUBJECT_EXTERNAL_GUIDANCE}
          </Typography>

          <TextField
            disabled={isIssuing}
            error={Boolean(errors.displayName)}
            fullWidth
            helperText={errors.displayName}
            inputProps={{ maxLength: 255 }}
            label={DISPLAY_NAME_LABEL}
            size="small"
            value={fields.displayName}
            onChange={(event) => setField('displayName', event.target.value)}
          />
          <TextField
            disabled={isIssuing}
            error={Boolean(errors.email)}
            fullWidth
            helperText={errors.email}
            inputProps={{ maxLength: 320 }}
            label={EMAIL_LABEL}
            size="small"
            type="email"
            value={fields.email}
            onChange={(event) => setField('email', event.target.value)}
          />
          <TextField
            disabled={isIssuing}
            error={Boolean(errors.organisationId)}
            fullWidth
            helperText={errors.organisationId ?? ORGANISATION_ID_OPTIONAL_GUIDANCE}
            inputProps={{ maxLength: 64 }}
            label={ORGANISATION_ID_LABEL}
            size="small"
            value={fields.organisationId}
            onChange={(event) => setField('organisationId', event.target.value)}
          />
          <TextField
            disabled={isIssuing}
            error={Boolean(errors.label)}
            fullWidth
            helperText={errors.label}
            inputProps={{ maxLength: 255 }}
            label={KEY_LABEL_LABEL}
            size="small"
            value={fields.label}
            onChange={(event) => setField('label', event.target.value)}
          />

          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {PASSKEY_MODE_LABEL}
            </Typography>
            <ToggleButtonGroup
              exclusive
              aria-label={PASSKEY_MODE_LABEL}
              color="primary"
              disabled={isIssuing}
              size="small"
              value={passkeyMode}
              onChange={handlePasskeyModeChange}>
              {PASSKEY_MODE_OPTIONS.map((option) => (
                <ToggleButton key={option.value} value={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Alert severity="info">{isExistingMode ? PASSKEY_EXISTING_GUIDANCE : PASSKEY_ISSUANCE_GUIDANCE}</Alert>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Box>
            <Button
              disabled={isIssuing || !canSubmit}
              startIcon={isIssuing ? <CircularProgress size={16} /> : undefined}
              type="submit"
              variant="contained">
              {isIssuing
                ? isExistingMode
                  ? ISSUING_LABEL_EXISTING
                  : ISSUING_LABEL
                : isExistingMode
                  ? ISSUE_BUTTON_LABEL_EXISTING
                  : ISSUE_BUTTON_LABEL}
            </Button>
          </Box>
        </Box>
      )}

      {isIssued && issuedCard && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert severity="success">{PASSKEY_CARD_ISSUED_NOTE}</Alert>

          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {DERIVED_PUBLIC_KEY_LABEL}
            </Typography>
            <Box alignItems="center" display="flex" gap={1}>
              <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }} variant="body2">
                {issuedCard.key.publicKey}
              </Typography>
              <Button size="small" variant="outlined" onClick={() => void handleCopyPublicKey()}>
                {publicKeyCopied ? COPY_PUBLIC_KEY_DONE_LABEL : COPY_PUBLIC_KEY_LABEL}
              </Button>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" gap={1}>
              <Button variant="contained" onClick={handleDownloadContactCard}>
                {CONTACT_CARD_DOWNLOAD_LABEL}
              </Button>
            </Box>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {CONTACT_CARD_DOWNLOAD_NOTE}
            </Typography>
          </Box>

          {/* Optional: bind a Veridian attestation to the card so an importer can verify the holder.
              The wallet signs it into its own key event log; nothing is published to Cardano. */}
          {!showAttestWizard && (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" gap={1}>
                <Button variant="outlined" onClick={() => setShowAttestWizard(true)}>
                  {ATTEST_WIZARD_OPEN_LABEL}
                </Button>
              </Box>
              <Typography color={theme.palette.text.secondary} variant="caption">
                {ATTEST_WIZARD_OPEN_NOTE}
              </Typography>
            </Box>
          )}

          {showAttestWizard && <AttestCardWizard card={issuedCard} onClose={() => setShowAttestWizard(false)} />}

          <Box>
            <Button variant="text" onClick={handleIssueAnother}>
              {ISSUE_ANOTHER_BUTTON_LABEL}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}
