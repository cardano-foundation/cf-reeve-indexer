import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Key, ShieldTick } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { useMediaQueries } from 'hooks'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { LandingSection } from 'modules/public-landing/components/LandingSection/LandingSection.component.tsx'
import { PATHS } from 'routes'

import { KeysIconStyled, KeysNoteStyled } from './LandingKeys.styles'

export const LandingKeys = () => {
  const { t } = useTranslations()
  const theme = useTheme()
  const { isMobile } = useMediaQueries()

  const keysButton = (
    <ButtonPrimary component={RouterLink} to={PATHS.CARD_ISSUANCE} viewTransition fullWidth={isMobile} size="small">
      {t({ id: 'landingKeysButton' })}
    </ButtonPrimary>
  )

  return (
    <LandingSection
      title={t({ id: 'landingKeysTitle' })}
      icon={
        <KeysIconStyled>
          <Key aria-hidden color={theme.palette.primary.main} size={24} variant="Bold" />
        </KeysIconStyled>
      }
      action={!isMobile && keysButton}
    >
      <Box display="flex" flexDirection="column">
        <Typography variant="body2">{t({ id: 'landingKeysDescription' })}</Typography>
        <KeysNoteStyled mt={2.5}>
          <ShieldTick aria-hidden color={theme.palette.primary.main} size={24} variant="Bold" />
          <Typography variant="body2" fontWeight={500} mt={0.25}>
            {t({ id: 'landingKeysNote' })}
          </Typography>
        </KeysNoteStyled>
        {isMobile && <Box mt={3}>{keysButton}</Box>}
      </Box>
    </LandingSection>
  )
}
