import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'

import type { AttestedKeyCard } from 'libs/api-connectors/backend-connector-reeve/api/cards/cardsApi.types'
import type { KeyCard } from 'libs/document-vault-crypto/cards'
import { downloadCardFile } from 'libs/document-vault-crypto/issue'
import { useAttestCardCeremony } from 'libs/models/cards-model/AttestCardCeremony/AttestCardCeremony.service'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import {
  ATTEST_ANCHOR_BUTTON_LABEL,
  ATTEST_ANCHOR_GUIDANCE,
  ATTEST_ANCHOR_TITLE,
  ATTEST_ANCHORING_LABEL,
  ATTEST_AGENT_OOBI_LABEL,
  ATTEST_AGENT_OOBI_PENDING,
  ATTEST_CANCEL_LABEL,
  ATTEST_CLOSE_LABEL,
  ATTEST_COPY_OOBI_DONE_LABEL,
  ATTEST_COPY_OOBI_LABEL,
  ATTEST_DONE_NOTE,
  ATTEST_DONE_TITLE,
  ATTEST_DOWNLOAD_LABEL,
  ATTEST_EXPIRED_MESSAGE,
  ATTEST_FAILED_TITLE,
  ATTEST_FALLBACK_ERROR,
  ATTEST_PAIR_BUTTON_LABEL,
  ATTEST_PAIR_TITLE,
  ATTEST_PAIRING_LABEL,
  ATTEST_PREPARING_LABEL,
  ATTEST_PRESENT_BUTTON_LABEL,
  ATTEST_PRESENT_GUIDANCE,
  ATTEST_PRESENT_TITLE,
  ATTEST_PRESENTING_LABEL,
  ATTEST_START_OVER_LABEL,
  ATTEST_TX_LABEL,
  ATTEST_WALLET_OOBI_GUIDANCE,
  ATTEST_WALLET_OOBI_LABEL,
  ATTEST_WIZARD_TITLE
} from 'modules/card-issuance/constants/attestation.consts'

type Props = {
  card: KeyCard
  onClose: () => void
}

const downloadAttestedCard = (card: AttestedKeyCard) =>
  downloadCardFile(card, `attested-key-card-${card.subject.subjectId}.json`)

/**
 * The attest-with-Veridian wizard (design doc Part A / A7). Opens a ceremony for the just-issued card
 * (Option B — the full client-built card is registered on create), then walks the holder through the
 * synchronous ceremony one blocking step at a time, branching on the authoritative server STATE:
 * CREATED (pair) -> PAIRED (present) -> CREDENTIAL_RECEIVED (attest) -> ATTEST_ANCHORED (download).
 * A step failure comes back as state=FAILED with a reason; a caller-side error (bad card at create)
 * is surfaced from the request. Either way the honest recovery is "start over" — the ceremony state
 * machine makes a FAILED step terminal.
 */
export const AttestCardWizard = ({ card, onClose }: Props) => {
  const theme = useTheme()
  const {
    ceremony,
    createCeremony,
    pair,
    present,
    attest,
    reset,
    isCreating,
    isPairing,
    isPresenting,
    isAttesting,
    isBusy,
    requestError
  } = useAttestCardCeremony()

  const [walletOobi, setWalletOobi] = useState('')
  const [oobiCopied, setOobiCopied] = useState(false)

  // Open the ceremony exactly once when the wizard mounts. The ref guard survives the re-render the
  // first createCeremony triggers, so React 18 StrictMode's double-invoke does not open two ceremonies.
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    createCeremony(card)
    // createCeremony/card are stable for the wizard's lifetime; this must run once, not per change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startOver = () => {
    setWalletOobi('')
    setOobiCopied(false)
    startedRef.current = true
    reset()
    createCeremony(card)
  }

  const handleCopyOobi = async () => {
    if (!ceremony?.agent_oobi) return
    await navigator.clipboard.writeText(ceremony.agent_oobi)
    setOobiCopied(true)
  }

  const state = ceremony?.state

  return (
    <Box display="flex" flexDirection="column" gap={2} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2 }}>
      <Typography variant="subtitle1">{ATTEST_WIZARD_TITLE}</Typography>

      {/* No ceremony yet: either still creating, or the create call itself failed (e.g. a rejected card). */}
      {!ceremony && (
        <Box display="flex" flexDirection="column" gap={2}>
          {requestError ? (
            <>
              <Alert severity="error">{requestError}</Alert>
              <Box>
                <Button variant="text" onClick={onClose}>
                  {ATTEST_CANCEL_LABEL}
                </Button>
              </Box>
            </>
          ) : (
            <Box alignItems="center" display="flex" gap={1}>
              <CircularProgress size={18} />
              <Typography variant="body2">{ATTEST_PREPARING_LABEL}</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* CREATED — pair the wallet. */}
      {state === 'CREATED' && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="subtitle2">{ATTEST_PAIR_TITLE}</Typography>

          {ceremony?.agent_oobi ? (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography color={theme.palette.text.secondary} variant="caption">
                {ATTEST_AGENT_OOBI_LABEL}
              </Typography>
              <Box alignItems="center" display="flex" gap={1}>
                <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }} variant="body2">
                  {ceremony.agent_oobi}
                </Typography>
                <Button size="small" variant="outlined" onClick={() => void handleCopyOobi()}>
                  {oobiCopied ? ATTEST_COPY_OOBI_DONE_LABEL : ATTEST_COPY_OOBI_LABEL}
                </Button>
              </Box>
            </Box>
          ) : (
            <Alert severity="info">{ATTEST_AGENT_OOBI_PENDING}</Alert>
          )}

          <TextField
            disabled={isPairing}
            fullWidth
            helperText={ATTEST_WALLET_OOBI_GUIDANCE}
            label={ATTEST_WALLET_OOBI_LABEL}
            size="small"
            value={walletOobi}
            onChange={(event) => setWalletOobi(event.target.value)}
          />

          {requestError && <Alert severity="error">{requestError}</Alert>}

          <Box display="flex" gap={1}>
            <Button
              disabled={isPairing || walletOobi.trim() === ''}
              startIcon={isPairing ? <CircularProgress size={16} /> : undefined}
              variant="contained"
              onClick={() => pair(walletOobi.trim())}>
              {isPairing ? ATTEST_PAIRING_LABEL : ATTEST_PAIR_BUTTON_LABEL}
            </Button>
            <Button disabled={isBusy} variant="text" onClick={onClose}>
              {ATTEST_CANCEL_LABEL}
            </Button>
          </Box>
        </Box>
      )}

      {/* PAIRED — present the credential (the wallet prompts; this blocks until it replies). */}
      {state === 'PAIRED' && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="subtitle2">{ATTEST_PRESENT_TITLE}</Typography>
          <Alert severity="info">{ATTEST_PRESENT_GUIDANCE}</Alert>
          {requestError && <Alert severity="error">{requestError}</Alert>}
          <Box alignItems="center" display="flex" gap={1}>
            <Button
              disabled={isPresenting}
              startIcon={isPresenting ? <CircularProgress size={16} /> : undefined}
              variant="contained"
              onClick={() => present()}>
              {isPresenting ? ATTEST_PRESENTING_LABEL : ATTEST_PRESENT_BUTTON_LABEL}
            </Button>
            {!isPresenting && (
              <Button variant="text" onClick={onClose}>
                {ATTEST_CANCEL_LABEL}
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* CREDENTIAL_RECEIVED — attest on-chain. A plain attest() also resumes a tx-only retry. */}
      {state === 'CREDENTIAL_RECEIVED' && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="subtitle2">{ATTEST_ANCHOR_TITLE}</Typography>
          <Alert severity="info">{ATTEST_ANCHOR_GUIDANCE}</Alert>
          {requestError && <Alert severity="error">{requestError}</Alert>}
          <Box alignItems="center" display="flex" gap={1}>
            <Button
              disabled={isAttesting}
              startIcon={isAttesting ? <CircularProgress size={16} /> : undefined}
              variant="contained"
              onClick={() => attest()}>
              {isAttesting ? ATTEST_ANCHORING_LABEL : ATTEST_ANCHOR_BUTTON_LABEL}
            </Button>
            {!isAttesting && (
              <Button variant="text" onClick={onClose}>
                {ATTEST_CANCEL_LABEL}
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* ATTEST_ANCHORED — success: hand back the attested card to download and import. */}
      {state === 'ATTEST_ANCHORED' && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert severity="success">{ATTEST_DONE_TITLE}</Alert>
          <Typography color={theme.palette.text.secondary} variant="body2">
            {ATTEST_DONE_NOTE}
          </Typography>

          {ceremony?.card?.attestation?.txHash && (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography color={theme.palette.text.secondary} variant="caption">
                {ATTEST_TX_LABEL}
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }} variant="body2">
                {ceremony.card.attestation.txHash}
              </Typography>
            </Box>
          )}

          <Box display="flex" gap={1}>
            <Button
              disabled={!ceremony?.card}
              variant="contained"
              onClick={() => ceremony?.card && downloadAttestedCard(ceremony.card)}>
              {ATTEST_DOWNLOAD_LABEL}
            </Button>
            <Button variant="text" onClick={onClose}>
              {ATTEST_CLOSE_LABEL}
            </Button>
          </Box>
        </Box>
      )}

      {/* FAILED / EXPIRED — a FAILED step is terminal in the state machine, so the recovery is to start
          a fresh ceremony rather than retry the dead one. */}
      {(state === 'FAILED' || state === 'EXPIRED') && (
        <Box display="flex" flexDirection="column" gap={2}>
          {state === 'EXPIRED' ? (
            <Alert severity="warning">{ATTEST_EXPIRED_MESSAGE}</Alert>
          ) : (
            <>
              <Alert severity="error">{ceremony?.error_title ?? ATTEST_FAILED_TITLE}</Alert>
              {ceremony?.error_detail && (
                <Typography color={theme.palette.text.secondary} variant="body2">
                  {ceremony.error_detail}
                </Typography>
              )}
            </>
          )}
          <Box display="flex" gap={1}>
            <Button disabled={isCreating} variant="contained" onClick={startOver}>
              {ATTEST_START_OVER_LABEL}
            </Button>
            <Button disabled={isCreating} variant="text" onClick={onClose}>
              {ATTEST_CLOSE_LABEL}
            </Button>
          </Box>
        </Box>
      )}

      {/* A caller-side error that left us with no usable ceremony state to render above. */}
      {ceremony && !state && <Alert severity="error">{requestError ?? ATTEST_FALLBACK_ERROR}</Alert>}
    </Box>
  )
}
