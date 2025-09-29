import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'

interface WarningDetailsProps {
  onDetailsClick: () => void
}

export const WarningDetails = ({ onDetailsClick }: WarningDetailsProps) => {
  const { t } = useTranslations()

  return (
    <Box mt={4}>
      <Alert severity="warning">
        <Grid alignItems="center" container size="grow" spacing={3}>
          <Grid size="grow">
            <Typography variant="body2">{t({ id: 'uploadWarningMessage' })}</Typography>
          </Grid>
          <Grid size="auto">
            <ButtonText size="small" onClick={onDetailsClick}>
              {t({ id: 'seeDetails' })}
            </ButtonText>
          </Grid>
        </Grid>
      </Alert>
    </Box>
  )
}
