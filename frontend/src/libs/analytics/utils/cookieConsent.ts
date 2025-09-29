const CONSENT_KEY = 'cookiePolicyConsent'

export const hasUserConsented = () => localStorage.getItem(CONSENT_KEY) === 'true'
export const hasUserDeclined = () => localStorage.getItem(CONSENT_KEY) === 'false'

export const setConsent = (value: boolean) => {
  localStorage.setItem(CONSENT_KEY, value ? 'true' : 'false')

  if (typeof window !== 'undefined' && window._paq) {
    if (value) {
      window._paq.push(['rememberCookieConsentGiven'])
    } else {
      window._paq.push(['forgetCookieConsentGiven'])
    }
  }
}
