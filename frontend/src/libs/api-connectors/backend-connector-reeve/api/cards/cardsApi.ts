import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'
import type { KeyCard } from 'libs/document-vault-crypto/cards'

import {
  CardCeremonyResponse,
  CardCeremonyStepRequest,
  CardStatusResponse,
  CreateCardCeremonyRequest,
  PairCardCeremonyRequest
} from './cardsApi.types'

/**
 * Card creation is PERMISSIONLESS and happens entirely in the browser (see document-vault-crypto:
 * buildCard), so there is no issue/registry/export call here and no operator credentials anywhere.
 * The public endpoints the frontend talks to are the status flag and the attest-with-Veridian
 * ceremony (also public — the wizard holds no operator credentials, so every call suppresses the
 * Authorization header with `{ Authorization: '' }`).
 */
export const cardsApi = (baseUrl: string) => {
  const { get, post } = httpService(baseUrl)

  const PUBLIC = { Authorization: '' }
  const CEREMONIES = 'api/v1/cards/attestation/ceremonies'

  // Public: card issuance can be toggled off; the toggle itself is readable without auth.
  const getStatus = () => get<CardStatusResponse>('api/v1/cards/status', null, PUBLIC)

  // Register the client-built card and open a ceremony for it (backend Option B).
  const createCeremony = (card: KeyCard) =>
    post<CardCeremonyResponse, CreateCardCeremonyRequest>(CEREMONIES, { card }, PUBLIC)

  // Pair the ceremony with the holder's Veridian wallet OOBI. Blocks server-side.
  const pairCeremony = (ceremonyId: string, walletOobiUrl: string) =>
    post<CardCeremonyResponse, PairCardCeremonyRequest>(`${CEREMONIES}/${ceremonyId}/pair`, { walletOobiUrl }, PUBLIC)

  // Present (or retry presenting) the wallet's credential. Blocks on the wallet's IPEX reply.
  const presentCredential = (ceremonyId: string, retry = false) =>
    post<CardCeremonyResponse, CardCeremonyStepRequest>(`${CEREMONIES}/${ceremonyId}/present-credential`, { retry }, PUBLIC)

  // Attest (or retry attesting) the card. Blocks on the wallet's remotesign reply + on-chain submit.
  const attestCeremony = (ceremonyId: string, retry = false) =>
    post<CardCeremonyResponse, CardCeremonyStepRequest>(`${CEREMONIES}/${ceremonyId}/attest`, { retry }, PUBLIC)

  // Current ceremony state — for resuming after a reload.
  const getCeremony = (ceremonyId: string) =>
    get<CardCeremonyResponse>(`${CEREMONIES}/${ceremonyId}`, null, PUBLIC)

  return {
    getStatus,
    createCeremony,
    pairCeremony,
    presentCredential,
    attestCeremony,
    getCeremony
  }
}
