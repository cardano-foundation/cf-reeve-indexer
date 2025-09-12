import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Setting } from 'iconsax-react'

import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CardSubPortal } from 'libs/ui-kit/components/CardSubPortal/CardSubPortal.component.tsx'
import { PATHS } from 'routes'

export const OrganizationCardsMenu = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Grid component="section" container spacing={3}>
      {hasPermission('organization_details', 'view') && (
        <Grid size={{ xs: 12, md: 4 }}>
          <CardSubPortal
            background={theme.palette.background.default}
            icon={Setting}
            iconColor={theme.palette.warning.main}
            title={t({ id: 'cardOrganizationDetailsTitle' })}
            to={PATHS.SETTINGS_ORGANIZATION_DETAILS}
          />
        </Grid>
      )}
      {hasPermission('chart_of_accounts', 'view') && (
        <Grid size={{ xs: 12, md: 4 }}>
          <CardSubPortal
            background={theme.palette.background.default}
            icon={Setting}
            iconColor={theme.palette.warning.main}
            title={t({ id: 'cardChartOfAccountsTitle' })}
            to={PATHS.SETTINGS_ACCOUNTS}
          />
        </Grid>
      )}
      {hasPermission('cost_centers', 'view') && (
        <Grid size={{ xs: 12, md: 4 }}>
          <CardSubPortal
            background={theme.palette.background.default}
            icon={Setting}
            iconColor={theme.palette.warning.main}
            title={t({ id: 'cardCostCentersTitle' })}
            to={PATHS.SETTINGS_COST_CENTERS}
          />
        </Grid>
      )}
      {hasPermission('vat_codes', 'view') && (
        <Grid size={{ xs: 12, md: 4 }}>
          <CardSubPortal
            background={theme.palette.background.default}
            icon={Setting}
            iconColor={theme.palette.warning.main}
            title={t({ id: 'cardVATCodesTitle' })}
            to={PATHS.SETTINGS_VAT_CODES}
          />
        </Grid>
      )}
      {hasPermission('event_codes', 'view') && (
        <Grid size={{ xs: 12, md: 4 }}>
          <CardSubPortal
            background={theme.palette.background.default}
            icon={Setting}
            iconColor={theme.palette.warning.main}
            title={t({ id: 'cardEventCodesTitle' })}
            to={PATHS.SETTINGS_EVENT_CODES}
          />
        </Grid>
      )}
    </Grid>
  )
}
