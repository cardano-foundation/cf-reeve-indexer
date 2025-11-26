import { Modal } from 'features/common'
import { useTranslations } from 'libs/translations/hooks/useTranslations'

import type { ModalReportProps } from './modal-report.types'
import { getReportPeriod } from 'modules/public-reports/utils/payload'
import { formatCurrency, snakeToNormal } from 'modules/public-reports/utils/format'
import { Grid } from 'features/mui/base/grid/grid.component'
import { NestedMap } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import Typography from '@mui/material/Typography'
import { formatNumber } from 'libs/utils/format'

export const ModalReport = ({ report, onClose, isOpen }: ModalReportProps) => {
  const { t } = useTranslations()

  const { currency, period, intervalType, year, data, type } = report

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <Modal.Header hasCloseButton>
        {t({ id: 'reportViewTitle' }, { currency: formatCurrency(currency), period: getReportPeriod(intervalType, period, year), type: t({ id: type }) })}
      </Modal.Header>
      <Modal.Content>
        <NestedGrid data={data} />
      </Modal.Content>
    </Modal>
  )
}

const NestedGrid: React.FC<{ data: NestedMap }> = ({ data }) => {
  return (
    <Grid container direction="column" mb={1} spacing={1}>
      {Object.entries(data).map(([key, value]) => {
        const isNested = typeof value === 'object' && value !== null

        if (isNested) {
          return (
            <Grid key={`nested-${key}`}>
              <Typography component="span" variant="h3">
                {snakeToNormal(key)}
              </Typography>
              <NestedGrid data={value as NestedMap} />
            </Grid>
          )
        }
        return (
          <Grid key={`item-${key}`} alignItems="center" container size="grow" spacing={{ xs: 1, sm: 3 }}>
            <Grid container size={{ xs: 12, sm: 'grow' }}>
              <Typography component="span">{snakeToNormal(key)}</Typography>
            </Grid>
            <Grid display="flex" justifyContent="flex-end" maxWidth={{ xs: '100%', sm: '14.5rem' }} size="grow">
              <Typography color={'text.primary'} component="span" variant="h3" pr={1.75}>
                {formatNumber(Number.parseInt(value as string))}
              </Typography>
            </Grid>
          </Grid>
        )
      })}
    </Grid>
  )
}
