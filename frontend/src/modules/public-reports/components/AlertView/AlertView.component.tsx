import { AlertProps as AlertPropsMUI } from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Danger, Forbidden2 } from 'iconsax-react'

import { ReportApiResponse } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'

const icons = {
  error: Forbidden2,
  warning: Danger
}

interface AlertViewProps extends AlertPropsMUI {
  message: string
  report?: ReportApiResponse
}

export const AlertView = ({ message, severity, report, sx, ...props }: AlertViewProps) => {
  const Icon = icons[severity as 'error' | 'warning']

  return (
    <Alert icon={<Icon variant="Outline" size={22} />} severity={severity} {...props}>
      <Grid alignItems="center" container spacing={3}>
        <Grid size="grow">
          <Typography variant="body2">{message}</Typography>
        </Grid>
      </Grid>
    </Alert>
  )
}
