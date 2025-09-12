import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Setting } from 'iconsax-react'

import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CardPortal } from 'libs/ui-kit/components/CardPortal/CardPortal.component.tsx'
import { PATHS } from 'routes'

export const SettingsCardsMenu = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Grid component="section" container spacing={3}>
      {hasPermission('settings', 'view') && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CardPortal
            description={t({ id: 'cardOrganizationDescription' })}
            background={theme.palette.warning.main}
            icon={Setting}
            title={t({ id: 'cardOrganizationTitle' })}
            to={PATHS.SETTINGS_ORGANIZATION}
          />
        </Grid>
      )}
    </Grid>
  )
}
