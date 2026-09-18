import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { useModal } from 'features/common'
import { LayoutFooterDesktopStyled } from 'libs/layout-kit/sections/LayoutFooterDesktop/LayoutFooterDesktop.styles.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { LegalDisclosureModal } from 'libs/ui-kit/components/LegalDisclosureModal/LegalDisclosureModal.component.tsx'

export const LayoutFooterDesktop = () => {
  const { t } = useTranslations()
  const { handleModalOpen, handleModalClose, isOpen } = useModal()

  return (
    <LayoutFooterDesktopStyled component="footer" container justifyContent="space-between" alignItems="center" width="100%">
      <Grid>
        <Typography component="span" variant="caption" color="textSecondary">
          {t({ id: 'footerDisclosureLine' })}
        </Typography>
      </Grid>
      <Grid>
        <Typography component="span" variant="caption">
          <Link component="button" type="button" onClick={handleModalOpen} underline="always">
            {t({ id: 'legalDisclosureLink' })}
          </Link>
        </Typography>
      </Grid>
      <LegalDisclosureModal isOpen={isOpen} onClose={handleModalClose} />
    </LayoutFooterDesktopStyled>
  )
}
