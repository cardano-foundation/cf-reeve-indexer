import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { DirectboxSend, Element4 } from 'iconsax-react'

import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CardPortal } from 'libs/ui-kit/components/CardPortal/CardPortal.component.tsx'
import { PATHS } from 'routes'

export const DataExplorerCardsMenu = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Grid component="section" container spacing={3}>
      {hasPermission('data_explorer', 'view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardDashboardDescription' })}
            background={theme.palette.secondary.main}
            icon={Element4}
            title={t({ id: 'cardDashboardTitle' })}
            to={PATHS.DATA_EXPLORER_DASHBOARD}
          />
        </Grid>
      )}
      {hasPermission('data_explorer', 'extraction_view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardExtractionDescription' })}
            background={theme.palette.warning.main}
            icon={DirectboxSend}
            title={t({ id: 'cardExtractionTitle' })}
            to={PATHS.DATA_EXPLORER_EXTRACTION}
          />
        </Grid>
      )}
    </Grid>
  )
}
