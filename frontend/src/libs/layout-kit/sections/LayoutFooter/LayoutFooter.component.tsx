import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { useModal } from 'features/common'
import { EXTERNAL_URLS } from 'libs/const/urls.ts'
import { LayoutFooterStyled, LogoStyled } from 'libs/layout-kit/sections/LayoutFooter/LayoutFooter.styles.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { LegalDisclosureModal } from 'libs/ui-kit/components/LegalDisclosureModal/LegalDisclosureModal.component.tsx'
import { LogoIcon } from 'libs/ui-kit/components/LogoIcon/LogoIcon.tsx'

export const LayoutFooter = () => {
  const { t } = useTranslations()
  const { handleModalOpen, handleModalClose, isOpen } = useModal()

  return (
    <LayoutFooterStyled alignItems="center" component="footer" container display="flex" flexDirection="column" spacing={2} width="100%">
      <Divider orientation="horizontal" flexItem />
      <Grid container px={1} py={1} spacing={2}>
        <Grid alignItems="center" container size="grow" spacing={0.5}>
          <Grid size="auto">
            <Typography component="span" variant="body2" whiteSpace="nowrap">
              {t({ id: 'poweredByLogoLabel' })}
            </Typography>
          </Grid>
          <Grid width="2.8125rem">
            <LogoStyled>
              <LogoIcon />
            </LogoStyled>
          </Grid>
        </Grid>
        <Divider orientation="vertical" />
        <Grid container direction="column" alignItems="center" spacing={0}>
          <Grid container spacing={2}>
            <Grid>
              <Typography component="span" variant="caption" whiteSpace="nowrap">
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
            </Grid>
            <Grid>
              <Typography component="span" variant="caption" whiteSpace="nowrap">
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
            </Grid>
          </Grid>
          <Grid>
            <Typography component="span" variant="caption" whiteSpace="nowrap">
              <Link component="button" type="button" onClick={handleModalOpen} underline="always">
                {t({ id: 'legalDisclosureLink' })}
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <LegalDisclosureModal isOpen={isOpen} onClose={handleModalClose} />
    </LayoutFooterStyled>
  )
}
