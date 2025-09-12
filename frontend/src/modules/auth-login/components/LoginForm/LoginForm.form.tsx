import { useTheme, IconButton, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import { Form, Formik, FormikValues } from 'formik'
import { Copy, Forbidden2 } from 'iconsax-react'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { termsOfUse } from 'assets/files'
import { APP_ADMIN_EMAIL } from 'libs/authentication/const/envs.ts'
import { logIn } from 'libs/authentication/services/logIn.service.ts'
import { redirectToKeycloakReset } from 'libs/authentication/utils/redirectToKeycloakReset'
import { FieldOTP } from 'libs/form-kit/components/FieldOTP/FieldOTP.component.tsx'
import { FieldPassword } from 'libs/form-kit/components/FieldPassword/FieldPassword.component.tsx'
import { FieldUsernameOrEmail } from 'libs/form-kit/components/FieldUsernameOrEmail/FieldUsernameOrEmail.component.tsx'
import { useFormLoginValidation } from 'libs/form-kit/validations/useFormLoginValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { LoginFormStyled } from 'modules/auth-login/components/LoginForm/LoginForm.styles.ts'
import { PATHS } from 'routes'

export interface LoginFormValues {
  usernameOrEmail: string
  password: string
  otp: string
}

const initialValues: LoginFormValues = {
  usernameOrEmail: '',
  password: '',
  otp: ''
}

export const LoginForm = () => {
  const [hasError, setHasError] = useState<boolean>(false)
  const theme = useTheme()
  const { t } = useTranslations()

  const navigate = useNavigate()
  const [copyEmail, setCopyEmail] = useState(false)

  const handleSubmit = async (values: FormikValues) => {
    try {
      await logIn({ usernameOrEmail: values.usernameOrEmail, password: values.password, otp: values.otp })
      navigate(PATHS.ROOT, { replace: true })
    } catch (error) {
      setHasError(true)
    }
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(APP_ADMIN_EMAIL)
    setCopyEmail(true)
    setTimeout(() => setCopyEmail(false), 2000)
  }

  const formLoginValidation = useFormLoginValidation()

  return (
    <LoginFormStyled>
      <Typography variant="h1" color={theme.palette.text.primary} pb={5}>
        {t({ id: 'loginToYourAccount' })}
      </Typography>
      <Formik<LoginFormValues>
        initialValues={initialValues}
        validationSchema={formLoginValidation}
        validateOnChange={true}
        validateOnBlur={true}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ values, errors }) => {
          return (
            <Form noValidate>
              <Box pb={3}>
                <FieldUsernameOrEmail />
              </Box>
              <Box pb={3}>
                <FieldPassword />
              </Box>
              <Box pb={3}>
                <FieldOTP />
              </Box>
              <Box pb={5}>
                <ButtonPrimary type="submit" disabled={Boolean(!values.usernameOrEmail || !values.password || !!errors.usernameOrEmail || !!errors.password)} fullWidth>
                  {t({ id: 'login' })}
                </ButtonPrimary>
              </Box>
            </Form>
          )
        }}
      </Formik>
      <Box display="flex" justifyContent="center" mb={2}>
        <ButtonText component={RouterLink} onClick={redirectToKeycloakReset}>
          {t({ id: 'forgotPassword' })}
        </ButtonText>
      </Box>
      <Box display="flex" justifyContent="center" p={1}>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            {t({ id: 'contactAdministrator' })}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography variant="caption" color="text.secondary">
              <Box component="span" display="flex" sx={{ gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {APP_ADMIN_EMAIL}
                </Typography>
                <Tooltip
                  title={copyEmail ? t({ id: 'emailCopied' }) : t({ id: 'copyEmail' })}
                  arrow={false}
                  PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, -8] } }] }}
                >
                  <IconButton size="small" onClick={handleCopyEmail} sx={{ p: 0.5 }} aria-label="Copy email address">
                    <Copy size={16} variant="Outline" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" p={1}>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            {t(
              { id: 'loginAgreement' },
              {
                terms: (chunks) => (
                  <Link href={termsOfUse} target="_blank" rel="noopener noreferrer" underline="always">
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link href="https://www.cardanofoundation.org/policy/privacy" target="_blank" rel="noopener noreferrer" underline="always">
                    {chunks}
                  </Link>
                )
              }
            )}
          </Typography>
        </Box>
      </Box>
      {hasError && (
        <Box mt={5}>
          <Alert icon={<Forbidden2 variant="Outline" size={22} />} severity="error" sx={{ alignItems: 'center' }}>
            <Grid alignItems="center" container spacing={3}>
              <Grid size="grow">
                <Typography variant="body2">{t({ id: 'invalidEmailOrPassword' })}</Typography>
              </Grid>
            </Grid>
          </Alert>
        </Box>
      )}
    </LoginFormStyled>
  )
}
