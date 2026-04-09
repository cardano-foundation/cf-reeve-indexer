import { Modal } from 'features/common'
import { useTranslations } from 'libs/translations/hooks/useTranslations'

import type { ModalReportProps } from './modal-report.types'
import { getReportPeriod } from 'modules/public-reports/utils/payload'
import { formatCurrency, snakeToNormal } from 'modules/public-reports/utils/format'
import { Grid, Divider } from 'features/mui/base'
import { NestedMap } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import Typography from '@mui/material/Typography'
import { formatNumber } from 'libs/utils/format'
import { ContentStyled } from './modal-report.styles'
import { computeNestedSum } from './modal-report.utils'
import { getLegacyReportConfig } from './modal-report.legacy-configs'

const createSafeT = (t: any) => (id?: string, variables?: Record<string, any>, fallback?: string) => {
  if (!id) return fallback || ''
  return t({ id, defaultMessage: fallback || snakeToNormal(id) }, variables)
}

export const ModalReport = ({ report, onClose, isOpen }: ModalReportProps) => {
  const { t } = useTranslations()
  const safeT = createSafeT(t)

  const { txHash, currency, period, intervalType, year, data, subType } = report

  const titleText = safeT(
    'reportViewTitle',
    {
      currency: formatCurrency(currency),
      period: getReportPeriod(intervalType, period, year),
      type: safeT(subType)
    },
    'Report for {currency} - {period} ({type})'
  )

  return (
    <Modal aria-labelledby="modal-report-title" onClose={onClose} isOpen={isOpen}>
      <Modal.Header id="modal-report-title" hasCloseButton>
        {safeT('reportDialogPreviewTitle', {}, 'Preview Report')}
      </Modal.Header>
      <Modal.Content>
        <ContentStyled container direction="column" spacing={2}>
          <Grid container justifyContent="space-between" size={12} spacing={3}>
            <Grid alignItems="center" container size="auto" spacing={2}>
              <Typography id="modal-report-title" color="textPrimary" component="h5" variant="h3">
                {titleText}
              </Typography>
            </Grid>
          </Grid>
          <Divider flexItem />
          <NestedGrid data={data} depth={0} safeT={safeT} reportHash={txHash} />
        </ContentStyled>
      </Modal.Content>
    </Modal>
  )
}

interface NestedGridProps {
  data: NestedMap
  depth?: number
  safeT: (id?: string, variables?: Record<string, any>, fallback?: string) => string
  reportHash?: string
}

const NestedGrid: React.FC<NestedGridProps> = ({ data, depth = 0, safeT, reportHash }) => {
  const indent = depth * 3
  const borderSX =
    depth > 0
      ? {
          borderLeft: '1px solid',
          borderColor: 'divider',
          pl: 2
        }
      : {}

  const camelize = (s: string) =>
    s
      .split(/_|(?=[A-Z])/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')

  const getLabel = (key: string) => safeT(key, {}, snakeToNormal(key))
  const getTotalLabel = (key: string, label: string) => safeT(`total${camelize(key)}`, {}, `Total ${label.toLowerCase()}`)

  // For known legacy income statement formats: apply explicit field ordering and
  // cumulative totals, where the grand-total section sums all previous sections.
  const legacyConfig = depth === 0 && reportHash != null ? getLegacyReportConfig(reportHash) : undefined
  const entries = legacyConfig
    ? Object.entries(data).sort(([a], [b]) => {
        const ai = legacyConfig.fieldOrder.indexOf(a)
        const bi = legacyConfig.fieldOrder.indexOf(b)
        if (ai === -1 && bi === -1) return a.localeCompare(b)
        if (ai === -1) return -1
        if (bi === -1) return 1
        return ai - bi
      })
    : Object.entries(data)
  const cumulativeTotals = new Map<string, number>()
  if (legacyConfig?.cumulativeSections || legacyConfig?.grandTotalField) {
    let running = 0
    entries.forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        running += computeNestedSum(value as NestedMap)
        cumulativeTotals.set(key, running)
      }
    })
  }

  return (
    <Grid container direction="column" mb={1} spacing={1} sx={{ pl: indent, ...borderSX }}>
      {entries.map(([key, value]) => {
        const isNested = typeof value === 'object' && value !== null
        const label = getLabel(key)

        if (isNested) {
          const subtotal = cumulativeTotals.has(key) ? cumulativeTotals.get(key)! : computeNestedSum(value as NestedMap)
          const totalLabel = getTotalLabel(key, label)
          return (
            <Grid key={`nested-${key}`}>
              <Typography
                component="span"
                variant={depth === 0 ? 'overline' : 'h3'}
                color={depth === 0 ? 'textSecondary' : 'textPrimary'}
                sx={{
                  textTransform: depth === 0 ? 'uppercase' : 'none',
                  fontVariant: depth === 0 ? 'narrow' : 'normal',
                  fontSize: depth === 0 ? '0.75rem' : undefined
                }}>
                {label}
              </Typography>

              <NestedGrid data={value as NestedMap} depth={depth + 1} safeT={safeT} reportHash={reportHash} />

              <Grid alignItems="center" container size="grow" spacing={{ xs: 1, sm: 3 }} sx={{ fontWeight: 'bold', mt: 0.5 }}>
                <Grid container size={{ xs: 12, sm: 'grow' }}>
                  <Typography component="span" sx={{ fontWeight: 700 }}>
                    {totalLabel}
                  </Typography>
                </Grid>
                <Grid display="flex" justifyContent="flex-end" maxWidth={{ xs: '100%', sm: '14.5rem' }} size="grow">
                  <Typography color={'text.primary'} component="span" variant="h3" pr={1.75} sx={{ fontWeight: 700 }}>
                    {formatNumber(subtotal)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          )
        }

        return (
          <Grid key={`item-${key}`} alignItems="center" container size="grow" spacing={{ xs: 1, sm: 3 }}>
            <Grid container size={{ xs: 12, sm: 'grow' }}>
              <Typography component="span">{label}</Typography>
            </Grid>
            <Grid display="flex" justifyContent="flex-end" maxWidth={{ xs: '100%', sm: '14.5rem' }} size="grow">
              <Typography color={'text.primary'} component="span" variant="h3" pr={1.75}>
                {formatNumber(Number.parseFloat(value as string))}
              </Typography>
            </Grid>
          </Grid>
        )
      })}
    </Grid>
  )
}
