import { AlertProps as AlertPropsMUI } from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Danger, Forbidden2 } from 'iconsax-react'

import { ReportApiResponse } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'

const icons = {
  error: Forbidden2,
  warning: Danger
}

interface AlertViewProps extends AlertPropsMUI {
  message: string
  report?: ReportApiResponse
  onViewOpen?: (report: ReportApiResponse) => void
}

export const AlertView = ({ message, severity, report, sx, onViewOpen, ...props }: AlertViewProps) => {
  const { t } = useTranslations()

  const Icon = icons[severity as 'error' | 'warning']

  return (
    <Alert icon={<Icon variant="Outline" size={22} />} severity={severity} {...props}>
      <Grid alignItems="center" container spacing={3}>
        <Grid size="grow">
          <Typography variant="body2">{message}</Typography>
        </Grid>
        {report && onViewOpen && (
          <Grid size="auto">
            <ButtonText onClick={() => onViewOpen(report)}>{t({ id: 'view' })}</ButtonText>
          </Grid>
        )}
      </Grid>
    </Alert>
  )
}
