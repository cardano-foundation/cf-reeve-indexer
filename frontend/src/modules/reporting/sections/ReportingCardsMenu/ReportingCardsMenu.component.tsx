import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { DocumentText, ExportSquare, FolderOpen } from 'iconsax-react'

import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CardPortal } from 'libs/ui-kit/components/CardPortal/CardPortal.component.tsx'
import { PATHS } from 'routes'

export const ReportingCardsMenu = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Grid component="section" container spacing={3}>
      {hasPermission('reports', 'create') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardReportDescription' })}
            background={theme.palette.info.main}
            icon={DocumentText}
            title={t({ id: 'cardReportTitle' })}
            to={PATHS.REPORTING_REPORT_PARAMETERS}
          />
        </Grid>
      )}
      {hasPermission('reports', 'publish_view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardPublishReportDescription' })}
            background={theme.palette.secondary.main}
            icon={ExportSquare}
            title={t({ id: 'cardPublishReportTitle' })}
            to={PATHS.REPORTING_PUBLISH}
          />
        </Grid>
      )}
      {hasPermission('reports', 'view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardAllReportsDescription' })}
            background={theme.palette.warning.main}
            icon={FolderOpen}
            title={t({ id: 'cardAllReportsTitle' })}
            to={PATHS.REPORTING_REPORTS}
          />
        </Grid>
      )}
    </Grid>
  )
}
