import { Snackbar, Box, useTheme } from '@mui/material'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { loadMatomo } from 'libs/analytics/loadMatomo'
import { hasUserConsented, hasUserDeclined, setConsent } from 'libs/analytics/utils/cookieConsent'
import { shouldEnableTracking } from 'libs/analytics/utils/shouldEnableTracking'
import { useTranslations } from 'libs/translations/hooks/useTranslations'

import { ButtonPrimary } from '../ButtonPrimary/ButtonPrimary.component'
import { ButtonSecondary } from '../ButtonSecondary/ButtonSecondary.component'

export const CookieConsentBanner = () => {
  const theme = useTheme()
  const location = useLocation()
  const [showBanner, setShowBanner] = useState(false)
  const { t } = useTranslations()

  useEffect(() => {
    const shouldShow = shouldEnableTracking(location.pathname) && !hasUserConsented() && !hasUserDeclined()
    setShowBanner(shouldShow)
  }, [location.pathname])

  const handleAccept = () => {
    setConsent(true)
    loadMatomo()
    setShowBanner(false)
  }

  const handleDecline = () => {
    setConsent(false)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        position: 'fixed',
        bottom: '0 !important',
        left: 0,
        width: '100vw',
        m: 0,
        '& .MuiSnackbarContent-root': {
          background: theme.palette.background.default,
          color: theme.palette.primary.main,
          padding: theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing(1),
          width: '100%',
          borderRadius: 0,
          flexFlow: 'row nowrap'
        }
      }}
      message={t({ id: 'cookieAcceptance' })}
      action={
        <Box display="flex" gap={1}>
          <ButtonSecondary color="inherit" onClick={handleDecline}>
            I decline
          </ButtonSecondary>
          <ButtonPrimary color="primary" onClick={handleAccept}>
            I accept
          </ButtonPrimary>
        </Box>
      }
    />
  )
}
