import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { ClipboardExport, GlobalSearch, DocumentUpload } from 'iconsax-react'

import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CardPortal } from 'libs/ui-kit/components/CardPortal/CardPortal.component.tsx'
import { PATHS } from 'routes'

export const HomeCardsMenu = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Grid component="section" container spacing={3}>
      {hasPermission('transactions', 'view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardTransactionsDescription' })}
            background={theme.palette.success.main}
            icon={ClipboardExport}
            title={t({ id: 'cardTransactionsTitle' })}
            to={PATHS.TRANSACTIONS}
          />
        </Grid>
      )}
      {hasPermission('reports', 'view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardReportingDescription' })}
            background={theme.palette.warning.main}
            icon={DocumentUpload}
            title={t({ id: 'cardReportingTitle' })}
            to={PATHS.REPORTING}
          />
        </Grid>
      )}
      {hasPermission('data_explorer', 'view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardDataExplorerDescription' })}
            background={theme.palette.info.main}
            icon={GlobalSearch}
            title={t({ id: 'cardDataExplorerTitle' })}
            to={PATHS.DATA_EXPLORER}
          />
        </Grid>
      )}
    </Grid>
  )
}
