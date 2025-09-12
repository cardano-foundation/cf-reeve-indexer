import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { ImportSquare, TaskSquare, ExportSquare, RecoveryConvert, FolderOpen } from 'iconsax-react'

import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CardPortal } from 'libs/ui-kit/components/CardPortal/CardPortal.component.tsx'
import { PATHS } from 'routes'

export const TransactionsCardsMenu = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Grid component="section" container spacing={3}>
      {hasPermission('transactions', 'import_view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardImportDescription' })}
            background={theme.palette.info.main}
            icon={ImportSquare}
            title={t({ id: 'cardImportTitle' })}
            to={PATHS.TRANSACTIONS_IMPORT}
          />
        </Grid>
      )}
      {hasPermission('transactions', 'review_view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardReviewDescription' })}
            background={theme.palette.tertiary.main}
            icon={TaskSquare}
            title={t({ id: 'cardReviewTitle' })}
            to={PATHS.TRANSACTIONS_REVIEW}
          />
        </Grid>
      )}
      {hasPermission('transactions', 'publish_view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardPublishDescription' })}
            background={theme.palette.secondary.main}
            icon={ExportSquare}
            title={t({ id: 'cardPublishTitle' })}
            to={PATHS.TRANSACTIONS_PUBLISH}
          />
        </Grid>
      )}
      {hasPermission('transactions', 'batches_view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardBatchesAllDescription' })}
            background={theme.palette.warning.main}
            icon={FolderOpen}
            title={t({ id: 'cardBatchesAllViewTitle' })}
            to={PATHS.TRANSACTIONS_BATCHES}
          />
        </Grid>
      )}
      {hasPermission('transactions', 'reconcilate_view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardReconciliationDescription' })}
            background={theme.palette.success.main}
            icon={RecoveryConvert}
            title={t({ id: 'cardReconciliationTitle' })}
            to={PATHS.TRANSACTIONS_RECONCILIATION}
          />
        </Grid>
      )}
    </Grid>
  )
}
