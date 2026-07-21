import { useMediaQuery, useTheme } from '@mui/material'
import { type DatasetElementType } from '@mui/x-charts/internals'

import { ProjectAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { ChartBarDashboards } from 'libs/data-visualisation-kit/components/ChartBarDashboards/ChartBarDashboards.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { colors } from 'libs/ui-kit/theme/colors.ts'
import { formatAuditAmount } from 'modules/public-events-auditor/utils/format.ts'

interface AuditAllocationChartProps {
  projects: ProjectAuditView[]
  currency: string | null
}

interface ChartDatum extends DatasetElementType<number | string> {
  label: string
  allocated: number
  spent: number
}

const MAX_BARS = 8
const CHART_COLORS = [colors.blue[600], colors.orange[500]]

const projectLabel = (project: ProjectAuditView, fallback: string) => project.projectTitle || project.projectId || fallback

export const AuditAllocationChart = ({ projects, currency }: AuditAllocationChartProps) => {
  const { t } = useTranslations()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const dataset: ChartDatum[] = [...projects]
    .sort((a, b) => b.allocatedAmount + b.spentAmount - (a.allocatedAmount + a.spentAmount))
    .slice(0, MAX_BARS)
    .map((project) => ({
      label: projectLabel(project, t({ id: 'auditUnattributed' })),
      allocated: project.allocatedAmount,
      spent: project.spentAmount
    }))

  const valueFormatter = (value: number | null) => (value !== null ? formatAuditAmount(value, currency, true) : null)

  return (
    <ChartBarDashboards
      colors={CHART_COLORS}
      dataset={dataset}
      grid={{ horizontal: true, vertical: false }}
      layout="vertical"
      margin={{ top: 20, right: 0, bottom: 10, left: 0 }}
      series={[
        { dataKey: 'allocated', label: t({ id: 'auditAllocated' }), valueFormatter },
        { dataKey: 'spent', label: t({ id: 'auditSpent' }), valueFormatter }
      ]}
      slotProps={{ tooltip: { trigger: 'axis' } }}
      xAxis={[
        {
          dataKey: 'label',
          id: 'label',
          height: 60,
          scaleType: 'band',
          tickLabelInterval: (_, index) => (isMobile ? index % 2 === 0 : true),
          tickLabelPlacement: 'middle',
          categoryGapRatio: 0.5
        }
      ]}
      yAxis={[
        {
          valueFormatter: (value: number) => formatAuditAmount(value, null, true),
          disableLine: true,
          disableTicks: true
        }
      ]}
    />
  )
}
