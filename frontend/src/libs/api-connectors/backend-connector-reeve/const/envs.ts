import { get } from 'lodash'

export interface BackendConfigurationLoB {
  apiUrl: string | undefined
}

export const APP_API_URL = import.meta.env.VITE_API_URL || get(window, 'env.VITE_API_URL')

export const backendConfigurationLoB: BackendConfigurationLoB = {
  apiUrl: APP_API_URL
}
