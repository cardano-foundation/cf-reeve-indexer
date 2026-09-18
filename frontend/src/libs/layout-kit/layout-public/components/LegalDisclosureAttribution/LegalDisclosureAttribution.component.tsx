import { useMediaQuery, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { InfoCircle } from 'iconsax-react'

import { useModal } from 'features/common'
import { IconButton } from 'features/mui/base'
import { useMediaQueries } from 'hooks'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { LegalDisclosureModal } from 'libs/ui-kit/components/LegalDisclosureModal/LegalDisclosureModal.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'

export const LegalDisclosureAttribution = () => {
  const { t } = useTranslations()
  const { handleModalOpen, handleModalClose, isOpen } = useModal()
  const { selectedOrganisation, organisations } = useLayoutPublicContext()
  const { isMobile } = useMediaQueries()
  const theme = useTheme()
  const isNarrow = useMediaQuery(theme.breakpoints.down(800))

  const organisation = organisations.find((org) => org.id === selectedOrganisation)

  if (!organisation || isMobile) return null

  return (
    <Grid alignItems="flex-start" container spacing={1} wrap="nowrap">
      <Grid size="auto">
        <Tooltip title={t({ id: 'legalDisclosureInfoButtonLabel' })}>
          <IconButton aria-label={t({ id: 'legalDisclosureInfoButtonLabel' })} onClick={handleModalOpen} size="small" sx={{ p: 0 }}>
            <InfoCircle size={24} variant="Outline" />
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid size="grow">
        <Typography component="span" variant="caption" color="textSecondary">
          {isNarrow ? t({ id: 'publishedByAttributionShortLabel' }) : t({ id: 'publishedByAttributionLabel' }, { organisation: organisation.name })}
        </Typography>
      </Grid>
      <LegalDisclosureModal isOpen={isOpen} onClose={handleModalClose} />
    </Grid>
  )
}
