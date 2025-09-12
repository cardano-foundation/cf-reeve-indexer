import { KEYCLOAK_REALM, KEYCLOAK_URL, KEYCLOAK_REDIRECT_URL, KEYCLOAK_CLIENT_ID } from 'libs/authentication/const/envs.ts'

export const redirectToKeycloakReset = () => {
  window.location.href = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/login-actions/reset-credentials?client_id=${KEYCLOAK_CLIENT_ID}&redirect_uri=${KEYCLOAK_REDIRECT_URL}`
}
