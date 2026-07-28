import { get } from 'lodash'

export interface BackendConfigurationLoB {
  apiUrl: string | undefined
}

export const APP_API_URL = import.meta.env.VITE_API_URL || get(window, 'env.VITE_API_URL')

// The explorer and IPFS gateway URL bases are frontend deployment config, not contract-frozen
// values - each deployment points at whichever explorer/gateway it trusts.
export const APP_EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL || get(window, 'env.VITE_EXPLORER_URL')

export const APP_IPFS_GATEWAY_URL = import.meta.env.VITE_IPFS_GATEWAY_URL || get(window, 'env.VITE_IPFS_GATEWAY_URL')

export const backendConfigurationLoB: BackendConfigurationLoB = {
  apiUrl: APP_API_URL
}
