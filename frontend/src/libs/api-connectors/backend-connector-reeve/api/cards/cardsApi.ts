import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'

import { CardStatusResponse } from './cardsApi.types'

/**
 * Card creation is PERMISSIONLESS and happens entirely in the browser (see document-vault-crypto:
 * buildCard), so there is no issue/registry/export call here and no operator credentials anywhere.
 * The only card endpoint the frontend talks to is the public status flag, which lets a deployment
 * hide the feature.
 */
export const cardsApi = (baseUrl: string) => {
  const { get } = httpService(baseUrl)

  // Public: card issuance can be toggled off; the toggle itself is readable without auth.
  const getStatus = () => get<CardStatusResponse>('api/v1/cards/status', null, { Authorization: '' })

  return {
    getStatus
  }
}
