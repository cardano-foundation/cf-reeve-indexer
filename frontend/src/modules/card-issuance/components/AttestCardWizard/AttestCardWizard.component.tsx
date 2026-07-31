import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'

import type { AttestedKeyCard, CardCeremonyState } from 'libs/api-connectors/backend-connector-reeve/api/cards/cardsApi.types'
import type { KeyCard } from 'libs/document-vault-crypto/cards'
import { downloadCardFile } from 'libs/document-vault-crypto/issue'
import { useAttestCardCeremony } from 'libs/models/cards-model/AttestCardCeremony/AttestCardCeremony.service'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { AttestWaitingPanel } from 'modules/card-issuance/components/AttestCardWizard/AttestWaitingPanel.component'
import { PresentedCredentialPanel } from 'modules/card-issuance/components/AttestCardWizard/PresentedCredentialPanel.component'
import {
  ATTEST_ANCHOR_BUTTON_LABEL,
  ATTEST_ANCHOR_GUIDANCE,
  ATTEST_ANCHOR_TITLE,
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
  ATTEST_PREPARING_LABEL,
  ATTEST_PRESENT_BUTTON_LABEL,
  ATTEST_PRESENT_GUIDANCE,
  ATTEST_PRESENT_TITLE,
  ATTEST_START_OVER_LABEL,
  ATTEST_STEPS,
  ATTEST_ANCHOR_LABEL,
  ATTEST_WAITING_ANCHOR_DETAIL,
  ATTEST_WAITING_PAIR_DETAIL,
  ATTEST_WAITING_PRESENT_DETAIL,
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
 * Which stepper index a LIVE server state sits at, or null for a terminal one.
 *
 * <p>Derived from the authoritative state rather than tracked locally, so a reloaded or resumed
 * ceremony lands on the right step with no client bookkeeping to drift.
 *
 * <p>FAILED/EXPIRED return null on purpose. The state machine overwrites the state on failure and
 * `CardCeremonyView` does not say which step died, so there is nothing here to derive it from —
 * folding them in with CREATED would blame step 0 for a wallet timeout that happened two steps later,
 * which is worse than saying nothing. The caller remembers the last live step instead.
 */
const liveStepIndexFor = (state: CardCeremonyState | undefined) => {
  switch (state) {
    case 'CREATED':
      return 0
    case 'PAIRED':
      return 1
    case 'CREDENTIAL_RECEIVED':
      return 2
    case 'ATTEST_ANCHORED':
      return 3
    default:
      return null
  }
}

/**
 * The attest-with-Veridian wizard. Opens a ceremony for the just-issued card — the full client-built
 * card is registered when the ceremony is created — then walks the holder through the synchronous
 * ceremony one blocking step at a time, branching on the authoritative server STATE:
 * CREATED (pair) -> PAIRED (present) -> CREDENTIAL_RECEIVED (attest) -> ATTEST_ANCHORED (download).
 * A step failure comes back as state=FAILED with a reason; a caller-side error (bad card at create)
 * is surfaced from the request. Either way the honest recovery is "start over" — the ceremony state
 * machine makes a FAILED step terminal.
 *
 * <p>Each blocking step swaps its controls for {@link AttestWaitingPanel} rather than merely disabling
 * them: these steps wait on a person approving a prompt in Veridian, not on the network, so the wait
 * is long by design and has to look deliberate rather than hung.
 *
 * <p>From CREDENTIAL_RECEIVED onward the credential the wallet presented is shown via
 * {@link PresentedCredentialPanel} — presented, NOT verified; see that component.
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
  const isTerminalFailure = state === 'FAILED' || state === 'EXPIRED'
  const presentedCredential = ceremony?.presented_credential

  // The response reporting FAILED has already overwritten the state, and the view does not say which
  // step died — so remember the last LIVE step this wizard actually saw, and mark that one. A ceremony
  // resumed after a reload has nothing to remember; then no step is marked at all, which is honest,
  // where defaulting to step 0 would positively assert that pairing failed when it plainly succeeded.
  const liveStep = liveStepIndexFor(state)
  const lastLiveStepRef = useRef<number | null>(null)
  if (liveStep !== null) {
    lastLiveStepRef.current = liveStep
  }
  const failedStep = isTerminalFailure ? lastLiveStepRef.current : null
  const activeStep = liveStep ?? failedStep ?? 0

  return (
    <Box display="flex" flexDirection="column" gap={2} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2 }}>
      <Typography variant="subtitle1">{ATTEST_WIZARD_TITLE}</Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 1 }}>
        {ATTEST_STEPS.map((label, index) => (
          <Step key={label}>
            {/* Only the step the ceremony actually died on is marked in error — the others are simply
                not reached, and colouring them all red would misreport where it went wrong. */}
            <StepLabel error={index === failedStep}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

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

          {isPairing ? (
            <AttestWaitingPanel detail={ATTEST_WAITING_PAIR_DETAIL} />
          ) : (
            <>
              <TextField
                fullWidth
                helperText={ATTEST_WALLET_OOBI_GUIDANCE}
                label={ATTEST_WALLET_OOBI_LABEL}
                size="small"
                value={walletOobi}
                onChange={(event) => setWalletOobi(event.target.value)}
              />

              {requestError && <Alert severity="error">{requestError}</Alert>}

              <Box display="flex" gap={1}>
                <Button disabled={walletOobi.trim() === ''} variant="contained" onClick={() => pair(walletOobi.trim())}>
                  {ATTEST_PAIR_BUTTON_LABEL}
                </Button>
                <Button disabled={isBusy} variant="text" onClick={onClose}>
                  {ATTEST_CANCEL_LABEL}
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}

      {/* PAIRED — present the credential (the wallet prompts; this blocks until it replies). */}
      {state === 'PAIRED' && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="subtitle2">{ATTEST_PRESENT_TITLE}</Typography>
          {isPresenting ? (
            <AttestWaitingPanel detail={ATTEST_WAITING_PRESENT_DETAIL} />
          ) : (
            <>
              <Alert severity="info">{ATTEST_PRESENT_GUIDANCE}</Alert>
              {requestError && <Alert severity="error">{requestError}</Alert>}
              <Box alignItems="center" display="flex" gap={1}>
                <Button variant="contained" onClick={() => present()}>
                  {ATTEST_PRESENT_BUTTON_LABEL}
                </Button>
                <Button variant="text" onClick={onClose}>
                  {ATTEST_CANCEL_LABEL}
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}

      {/* CREDENTIAL_RECEIVED — the wallet signs the attestation into its own KEL. Nothing is published. */}
      {state === 'CREDENTIAL_RECEIVED' && (
        <Box display="flex" flexDirection="column" gap={2}>
          {presentedCredential && <PresentedCredentialPanel credential={presentedCredential} />}
          <Typography variant="subtitle2">{ATTEST_ANCHOR_TITLE}</Typography>
          {isAttesting ? (
            <AttestWaitingPanel detail={ATTEST_WAITING_ANCHOR_DETAIL} />
          ) : (
            <>
              <Alert severity="info">{ATTEST_ANCHOR_GUIDANCE}</Alert>
              {requestError && <Alert severity="error">{requestError}</Alert>}
              <Box alignItems="center" display="flex" gap={1}>
                <Button variant="contained" onClick={() => attest()}>
                  {ATTEST_ANCHOR_BUTTON_LABEL}
                </Button>
                <Button variant="text" onClick={onClose}>
                  {ATTEST_CANCEL_LABEL}
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}

      {/* ATTEST_ANCHORED — success: hand back the attested card to download and import. */}
      {state === 'ATTEST_ANCHORED' && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert severity="success">{ATTEST_DONE_TITLE}</Alert>
          <Typography color={theme.palette.text.secondary} variant="body2">
            {ATTEST_DONE_NOTE}
          </Typography>

          {presentedCredential && <PresentedCredentialPanel credential={presentedCredential} />}

          {ceremony?.card?.attestation?.kelEventSaid && (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography color={theme.palette.text.secondary} variant="caption">
                {ATTEST_ANCHOR_LABEL}
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }} variant="body2">
                #{ceremony.card.attestation.kelSequence} · {ceremony.card.attestation.kelEventSaid}
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
      {isTerminalFailure && (
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
