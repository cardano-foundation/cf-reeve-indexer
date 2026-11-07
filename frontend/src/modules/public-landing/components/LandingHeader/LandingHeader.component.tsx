import Link from '@mui/material/Link'
import { Link as RouterLink } from 'react-router-dom'

import { EXTERNAL_URLS } from 'libs/const/urls.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { LogoIcon } from 'libs/ui-kit/components/LogoIcon/LogoIcon.tsx'
import { PATHS } from 'routes'

import { LandingHeaderStyled, LogoStyled } from './LandingHeader.styles'

export const LandingHeader = () => {
  const { t } = useTranslations()

  return (
    <LandingHeaderStyled component="header">
      <Link component={RouterLink} to={PATHS.ROOT} aria-label={t({ id: 'landingHomeLink' })} display="flex">
        <LogoStyled>
          <LogoIcon />
        </LogoStyled>
      </Link>
      <ButtonSecondary href={EXTERNAL_URLS.PRODUCT_PAGE} size="small">
        {t({ id: 'landingProductPage' })}
      </ButtonSecondary>
    </LandingHeaderStyled>
  )
}
