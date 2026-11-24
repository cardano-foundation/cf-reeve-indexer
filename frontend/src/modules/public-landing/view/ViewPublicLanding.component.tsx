import { useMediaQuery } from '@mui/material'
import Box from '@mui/material/Box'
import { useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service'
import { useGetOrganisationsLastUpdatedModel } from 'libs/models/organisation-model/GetOrganisationsLastUpdated/GetOrganisationsLastUpdated.service'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CookieConsentBanner } from 'libs/ui-kit/components/CookieConsentBanner/CookieConsentBanner.tsx'
import { LandingFaq } from 'modules/public-landing/components/LandingFaq/LandingFaq.component.tsx'
import { LandingFooter } from 'modules/public-landing/components/LandingFooter/LandingFooter.component.tsx'
import { LandingGetStarted } from 'modules/public-landing/components/LandingGetStarted/LandingGetStarted.component.tsx'
import { LandingHeader } from 'modules/public-landing/components/LandingHeader/LandingHeader.component.tsx'
import { LandingHero } from 'modules/public-landing/components/LandingHero/LandingHero.component.tsx'
import { LandingKeys } from 'modules/public-landing/components/LandingKeys/LandingKeys.component.tsx'
import { LandingOrganisations } from 'modules/public-landing/components/LandingOrganisations/LandingOrganisations.component.tsx'
import { LandingPartners } from 'modules/public-landing/components/LandingPartners/LandingPartners.component.tsx'
import { LandingPartner } from 'modules/public-landing/components/LandingPartners/LandingPartners.types.ts'
import { LandingSection } from 'modules/public-landing/components/LandingSection/LandingSection.component.tsx'
import { getGridColumns } from 'modules/public-landing/utils/grid.ts'
import { getOrgPath } from 'routes'

import { LandingGlobalStyle, LandingStyled, MainStyled, SkipLinkStyled, TopGridStyled } from './ViewPublicLanding.styles'

export const ViewPublicLanding = () => {
  const { t } = useTranslations()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { organisations, isPending: isOrganisationsPending, isError: isOrganisationsError } = useGetOrganisationsModel()
  const { organisationsLastUpdated, isPending: isLastUpdatedPending, isError: isLastUpdatedError } = useGetOrganisationsLastUpdatedModel()
  const isPending = isOrganisationsPending || isLastUpdatedPending
  const isError = isOrganisationsError || isLastUpdatedError
  const faqTitleRef = useRef<HTMLHeadingElement>(null)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    const orgId = searchParams.get('organisation_id')
    if (orgId && organisations?.some((organisation) => organisation.id === orgId)) {
      navigate(getOrgPath('reports', orgId), { replace: true })
    }
  }, [searchParams, organisations, navigate])

  const handleFaqClick = useCallback(() => {
    faqTitleRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
    faqTitleRef.current?.focus({ preventScroll: true })
  }, [prefersReducedMotion])

  const partners: LandingPartner[] = []
  const isSplit = (organisations?.length ?? 0) <= 1 && partners.length === 1

  return (
    <LandingStyled>
      <LandingGlobalStyle />
      <SkipLinkStyled href="#main-content">{t({ id: 'landingSkipToContent' })}</SkipLinkStyled>
      <LandingHeader />
      <Box component="main" id="main-content" tabIndex={-1} flex="1 0 auto" sx={{ outline: 'none' }}>
        <LandingHero onFaqClick={handleFaqClick} />
        <MainStyled>
          <TopGridStyled $isSplit={isSplit} $isPartnerAnimated={!isError}>
            <LandingSection title={t({ id: 'landingPublishedTitle' })} description={t({ id: 'landingPublishedDescription' })}>
              <LandingOrganisations organisations={organisations} organisationsLastUpdated={organisationsLastUpdated} isPending={isPending} isError={isError} isCompact={isSplit} />
            </LandingSection>
            <LandingPartners partners={partners} columns={getGridColumns(partners.length)} />
          </TopGridStyled>
          <LandingKeys />
          <LandingFaq ref={faqTitleRef} />
          <LandingGetStarted />
        </MainStyled>
      </Box>
      <LandingFooter />
      <CookieConsentBanner />
    </LandingStyled>
  )
}
