import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Chart2, ReceiptText } from 'iconsax-react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CardPortal } from 'libs/ui-kit/components/CardPortal/CardPortal.component.tsx'
import { PATHS } from 'routes'

export const ProjectsCardsMenu = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Grid component="section" container spacing={{ xs: 2, sm: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardPortal
          description={t({ id: 'cardEventsDescription' })}
          background={theme.palette.secondary.main}
          icon={ReceiptText}
          title={t({ id: 'cardEventsTitle' })}
          to={PATHS.PUBLIC_PROJECTS_EVENTS}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardPortal
          description={t({ id: 'cardOverviewDescription' })}
          background={theme.palette.tertiary.main}
          icon={Chart2}
          title={t({ id: 'cardOverviewTitle' })}
          to={PATHS.PUBLIC_PROJECTS_OVERVIEW}
        />
      </Grid>
    </Grid>
  )
}
