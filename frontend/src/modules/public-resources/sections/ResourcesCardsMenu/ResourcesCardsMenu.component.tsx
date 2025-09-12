import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Map1, TextItalic } from 'iconsax-react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CardPortal } from 'libs/ui-kit/components/CardPortal/CardPortal.component.tsx'
import { PATHS } from 'routes'

export const ResourcesCardsMenu = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Grid component="section" container spacing={{ xs: 2, sm: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardPortal
          description={t({ id: 'cardGlossaryDescription' })}
          background={theme.palette.secondary.main}
          icon={TextItalic}
          title={t({ id: 'cardGlossaryTitle' })}
          to={PATHS.PUBLIC_RESOURCES_GLOSSARY}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CardPortal
          description={t({ id: 'cardUserGuideDescription' })}
          background={theme.palette.tertiary.main}
          icon={Map1}
          title={t({ id: 'cardUserGuideTitle' })}
          to={PATHS.PUBLIC_RESOURCES_USERGUIDE}
        />
      </Grid>
    </Grid>
  )
}
