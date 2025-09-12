import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { LogoIcon } from 'libs/ui-kit/components/LogoIcon/LogoIcon.tsx'
import { Snackbar, SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { LoginForm } from 'modules/auth-login/components/LoginForm/LoginForm.form.tsx'

export const ViewLogin = () => {
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)

  const { t } = useTranslations()

  const theme = useTheme()

  const location = useLocation()
  const { logOutReason } = location.state || {}

  useEffect(() => {
    if (logOutReason === 'loggedOutInactiveUser') {
      setIsSnackbarVisible(true)
    }
  }, [logOutReason])

  const handleClose = () => {
    setIsSnackbarVisible(false)
  }

  return (
    <>
      <Grid container display="flex" height="100%">
        <Grid display="flex" justifyContent="center" alignItems="center" px={{ xs: 3, sm: 6 }} pt={{ xs: 4, sm: 8 }} pb={{ xs: 3, sm: 6 }} m={'auto'}>
          <Grid size={12}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyItems="center" gap={2}>
              <LogoIcon />
              <Typography variant="body2" align="center" color={theme.palette.text.secondary} pb={5}>
                {t({ id: 'nextGenerationAccountability' })}
              </Typography>
            </Box>
            <LoginForm />
          </Grid>
        </Grid>
      </Grid>
      <Snackbar open={isSnackbarVisible} onClose={handleClose} message={t({ id: 'loggedOut' })} type={SnackbarType.INFO} shouldAutohide={false} />
    </>
  )
}
