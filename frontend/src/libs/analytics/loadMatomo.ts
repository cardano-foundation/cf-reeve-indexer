declare global {
  interface Window {
    _paq?: MatomoCommand[]
  }
}

type MatomoCommand =
  | ['trackPageView']
  | ['enableLinkTracking']
  | ['setDocumentTitle', string]
  | ['setTrackerUrl', string]
  | ['setSiteId', string]
  | ['disableCookies']
  | ['requireCookieConsent']
  | ['setConsentGiven']
  | ['setConsentDenied']
  | ['rememberCookieConsentGiven']
  | ['forgetCookieConsentGiven']

export const loadMatomo = () => {
  if (typeof window === 'undefined') return

  const path = window.location.pathname
  const shouldTrack = !/^\/(secure|auth)/.test(path)

  window._paq = window._paq || []

  window._paq.push(['requireCookieConsent'])

  if (localStorage.getItem('cookiePolicyConsent') === 'true') {
    window._paq.push(['rememberCookieConsentGiven'])
  }

  window._paq.push(['enableLinkTracking'])
  window._paq.push(['setTrackerUrl', 'https://cardanofoundation.matomo.cloud/matomo.php'])
  window._paq.push(['setSiteId', '12'])

  if (shouldTrack) {
    window._paq.push(['trackPageView'])
  }

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://cdn.matomo.cloud/cardanofoundation.matomo.cloud/matomo.js'
  document.head.appendChild(script)
}

export {}
