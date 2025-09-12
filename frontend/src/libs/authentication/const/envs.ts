import { get } from 'lodash'

export const APP_VERSION = import.meta.env.VITE_VERSION || get(window, 'env.VITE_VERSION')
export const APP_API_URL = import.meta.env.VITE_API_URL || get(window, 'env.VITE_API_URL')
export const APP_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || get(window, 'env.VITE_ADMIN_EMAIL')
export const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || get(window, 'env.VITE_KEYCLOAK_URL')
export const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || get(window, 'env.VITE_KEYCLOAK_REALM')
export const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || get(window, 'env.VITE_KEYCLOAK_CLIENT_ID')
export const KEYCLOAK_REDIRECT_URL = import.meta.env.VITE_KEYCLOAK_REDIRECT_URL || get(window, 'env.VITE_KEYCLOAK_REDIRECT_URL')
