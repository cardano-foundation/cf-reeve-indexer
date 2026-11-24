import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { useModal } from 'features/common'
import { EXTERNAL_URLS } from 'libs/const/urls.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { LegalDisclosureModal } from 'libs/ui-kit/components/LegalDisclosureModal/LegalDisclosureModal.component.tsx'

import { LandingFooterStyled } from './LandingFooter.styles'

export const LandingFooter = () => {
  const { t } = useTranslations()
  const { handleModalOpen, handleModalClose, isOpen } = useModal()

  return (
    <LandingFooterStyled component="footer" container justifyContent="space-between" alignItems="center" width="100%" spacing={2}>
      <Grid size={{ xs: 12, md: 'grow' }}>
        <Typography component="span" variant="caption" color="textSecondary">
          {t({ id: 'landingFooterDisclosure' })}
        </Typography>
      </Grid>
      <Grid container spacing={2}>
        <Typography component="span" variant="caption">
          {t(
            { id: 'termsOfUseLink' },
            {
              terms: (chunks) => (
                <Link href={EXTERNAL_URLS.TERMS_OF_USE} target="_blank" rel="noopener noreferrer" underline="always">
                  {chunks}
                </Link>
              )
            }
          )}
        </Typography>
        <Typography component="span" variant="caption">
          {t(
            { id: 'privacyPolicyLink' },
            {
              privacy: (chunks) => (
                <Link href={EXTERNAL_URLS.PRIVACY_POLICY} target="_blank" rel="noopener noreferrer" underline="always">
                  {chunks}
                </Link>
              )
            }
          )}
        </Typography>
        <Typography component="span" variant="caption">
          <Link component="button" type="button" onClick={handleModalOpen} underline="always">
            {t({ id: 'legalDisclosureLink' })}
          </Link>
        </Typography>
      </Grid>
      <LegalDisclosureModal isOpen={isOpen} onClose={handleModalClose} />
    </LandingFooterStyled>
  )
}
