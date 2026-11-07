import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ExportSquare } from 'iconsax-react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Avatar } from 'libs/ui-kit/components/Avatar/Avatar.component.tsx'
import { colors } from 'libs/ui-kit/theme/colors.ts'
import { getInitials } from 'libs/utils/getInitials.ts'
import { LandingSection } from 'modules/public-landing/components/LandingSection/LandingSection.component.tsx'
import { LandingPartner } from 'modules/public-landing/utils/mockLanding.ts'

import { PartnerLinkStyled, PartnerListStyled } from './LandingPartners.styles'

interface LandingPartnersProps {
  partners: LandingPartner[]
  columns: number
}

export const LandingPartners = ({ partners, columns }: LandingPartnersProps) => {
  const { t } = useTranslations()
  const theme = useTheme()

  if (partners.length === 0) return null

  return (
    <LandingSection title={t({ id: 'landingPartnersTitle' })} description={t({ id: 'landingPartnersDescription' }, { count: partners.length })}>
      <PartnerListStyled $columns={columns}>
        {partners.map(({ name, domain }) => (
          <li key={name}>
            <PartnerLinkStyled href={`https://${domain}`} target="_blank" rel="noopener noreferrer" aria-label={`${name}, ${domain} ${t({ id: 'landingOpensInNewTab' })}`}>
              <Avatar aria-hidden background={colors.neutral[100]}>
                {getInitials(name)}
              </Avatar>
              <Box flex="1 1 auto" minWidth={0}>
                <Typography component="span" display="block" variant="subtitle2" noWrap>
                  {name}
                </Typography>
                <Typography component="span" display="block" color="text.secondary" variant="caption">
                  {domain}
                </Typography>
              </Box>
              <ExportSquare aria-hidden color={theme.palette.text.secondary} size={20} />
            </PartnerLinkStyled>
          </li>
        ))}
      </PartnerListStyled>
    </LandingSection>
  )
}
