import Typography from '@mui/material/Typography'

import { EXTERNAL_URLS } from 'libs/const/urls.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'

import { GetStartedStyled } from './LandingGetStarted.styles'

export const LandingGetStarted = () => {
  const { t } = useTranslations()

  return (
    <GetStartedStyled component="section" aria-labelledby="landing-get-started-title">
      <Typography id="landing-get-started-title" component="h2" variant="subtitle2">
        {t({ id: 'landingGetStartedTitle' })}
      </Typography>
      <ButtonPrimary href={EXTERNAL_URLS.PRODUCT_PAGE} size="small">
        {t({ id: 'landingGetStartedButton' })}
      </ButtonPrimary>
    </GetStartedStyled>
  )
}
