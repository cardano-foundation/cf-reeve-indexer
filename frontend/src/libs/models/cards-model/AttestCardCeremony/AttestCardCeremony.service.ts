import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import type { CardCeremonyResponse } from 'libs/api-connectors/backend-connector-reeve/api/cards/cardsApi.types'
import type { KeyCard } from 'libs/document-vault-crypto/cards'

/**
 * Prefer the backend ProblemDetail (axios stashes it under response.data) over the generic axios
 * message, so a caller-side usage error (bad ceremony id, malformed/private-key card at create) reads
 * as its real reason. NOTE a "failed step" is NOT an error here — it comes back as a 200 with
 * state=FAILED and is read off the ceremony, never thrown.
 */
const errorMessageOf = (err: unknown): string => {
  const data = (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data
  return data?.detail ?? data?.title ?? (err instanceof Error ? err.message : 'Unexpected error')
}

/**
 * Drives one card-attestation ceremony through its synchronous steps (create -> pair ->
 * present-credential -> attest), holding the latest {@link CardCeremonyResponse}. Each step is a
 * blocking POST; the returned STATE is authoritative (a step failure is state=FAILED, not a thrown
 * error), so the wizard branches on `ceremony.state`. The ceremony id is kept in a ref so a step's
 * mutationFn never closes over a stale value between renders.
 */
export const useAttestCardCeremony = () => {
  const { cardsApi } = backendReeveApi()
  const [ceremony, setCeremony] = useState<CardCeremonyResponse | null>(null)
  const ceremonyIdRef = useRef<string | null>(null)

  const remember = (next: CardCeremonyResponse) => {
    ceremonyIdRef.current = next.ceremony_id
    setCeremony(next)
  }
  const currentId = (): string => {
    const id = ceremonyIdRef.current
    if (!id) throw new Error('No active ceremony')
    return id
  }

  const create = useMutation({ mutationFn: (card: KeyCard) => cardsApi.createCeremony(card), onSuccess: remember })
  const pair = useMutation({ mutationFn: (walletOobiUrl: string) => cardsApi.pairCeremony(currentId(), walletOobiUrl), onSuccess: remember })
  const present = useMutation({ mutationFn: (retry: boolean) => cardsApi.presentCredential(currentId(), retry), onSuccess: remember })
  const attest = useMutation({ mutationFn: (retry: boolean) => cardsApi.attestCeremony(currentId(), retry), onSuccess: remember })

  const reset = () => {
    ceremonyIdRef.current = null
    setCeremony(null)
    create.reset()
    pair.reset()
    present.reset()
    attest.reset()
  }

  const failedMutation = [create, pair, present, attest].find((mutation) => mutation.isError)

  return {
    ceremony,
    createCeremony: (card: KeyCard) => create.mutate(card),
    pair: (walletOobiUrl: string) => pair.mutate(walletOobiUrl),
    present: (retry = false) => present.mutate(retry),
    attest: (retry = false) => attest.mutate(retry),
    reset,
    isCreating: create.isPending,
    isPairing: pair.isPending,
    isPresenting: present.isPending,
    isAttesting: attest.isPending,
    isBusy: create.isPending || pair.isPending || present.isPending || attest.isPending,
    // A caller-side (non-2xx) failure of the LAST step; a state=FAILED step is on `ceremony`, not here.
    requestError: failedMutation ? errorMessageOf(failedMutation.error) : null
  }
}
