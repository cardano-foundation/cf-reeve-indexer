import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { ApiError } from 'libs/api-connectors/backend-connector-reeve/api/errors.types.ts'
import { useTheme } from '@mui/material'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'

export type ErrorDetail = Pick<ApiError, 'detail' | 'status' | 'title'>

interface ErrorDetailsProps {
  errors: ErrorDetail[]
  onDetailsClick: () => void
  hasDetails?: boolean
}

export const ErrorDetails = ({ errors, onDetailsClick, hasDetails = false }: ErrorDetailsProps) => {
  const { t } = useTranslations()
  const theme = useTheme()
  return (
    <Grid container mt={4} size="grow" spacing={2}>
      {errors.map(({ title }) => (
        <Grid key={title} size="grow">
          <Alert severity="error">
            <Grid alignItems="center" container size="grow" spacing={3}>
              <Grid size="grow">
                <Typography variant="body2">{t({ id: title })}</Typography>
              </Grid>
              {hasDetails && (
                <Grid size="auto">
                  <ButtonText color="error" size="small" sx={{ color: theme.palette.error.dark }} onClick={onDetailsClick}>
                    {t({ id: 'seeDetails' })}
                  </ButtonText>
                </Grid>
              )}
            </Grid>
          </Alert>
        </Grid>
      ))}
    </Grid>
  )
}
