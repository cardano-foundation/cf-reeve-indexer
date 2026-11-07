import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { ArrowDown2, Buliding, DocumentText, ShieldTick } from 'iconsax-react'

import { useMediaQueries } from 'hooks'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { colors } from 'libs/ui-kit/theme/colors.ts'

import {
  HeroClaimStyled,
  HeroInnerStyled,
  HeroNoteStyled,
  HeroStyled,
  HeroTitleStyled,
  StepIconStyled,
  StepNumberStyled,
  StepsStyled,
  StepStyled
} from './LandingHero.styles'

interface LandingHeroProps {
  onFaqClick: () => void
}

export const LandingHero = ({ onFaqClick }: LandingHeroProps) => {
  const { t } = useTranslations()
  const theme = useTheme()
  const { isMobile } = useMediaQueries()

  const steps = [
    { icon: Buliding, label: t({ id: 'landingStepFind' }), background: colors.blue[300] },
    { icon: DocumentText, label: t({ id: 'landingStepRead' }), background: colors.green[300] },
    { icon: ShieldTick, label: t({ id: 'landingStepVerify' }), background: colors.orange[300] }
  ]

  return (
    <HeroStyled component="section" aria-labelledby="landing-title">
      <HeroInnerStyled>
        <Box>
          <HeroTitleStyled id="landing-title" variant="h1">
            {t({ id: 'reeveIndexer' })}
          </HeroTitleStyled>
          <HeroClaimStyled>{t({ id: 'landingHeroClaim' })}</HeroClaimStyled>
          <HeroNoteStyled color="text.secondary" variant="body2">
            {t({ id: 'landingHeroNote' })}
          </HeroNoteStyled>
        </Box>
        <StepsStyled aria-label={t({ id: 'landingStepsLabel' })}>
          {steps.map(({ icon: Icon, label, background }, index) => (
            <StepStyled key={label} $index={index}>
              <StepIconStyled $background={background} $index={index}>
                <Icon aria-hidden color={theme.palette.primary.main} size={24} variant="Bold" />
                <StepNumberStyled aria-hidden>{index + 1}</StepNumberStyled>
              </StepIconStyled>
              <Typography variant="body2" fontWeight={500}>
                {label}
              </Typography>
            </StepStyled>
          ))}
        </StepsStyled>
        {isMobile && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <Link component="button" type="button" onClick={onFaqClick} underline="always" variant="body2" color="text.primary">
              {t({ id: 'landingFaqLink' })}
            </Link>
            <ArrowDown2 aria-hidden color={theme.palette.primary.main} size={48} />
          </Box>
        )}
      </HeroInnerStyled>
    </HeroStyled>
  )
}
