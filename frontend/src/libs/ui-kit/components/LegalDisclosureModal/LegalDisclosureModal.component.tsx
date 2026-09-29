import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { Modal } from 'features/common'
import { Grid } from 'features/mui/base'
import { EXTERNAL_URLS } from 'libs/const/urls.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'

interface LegalDisclosureModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LegalDisclosureModal = ({ isOpen, onClose }: LegalDisclosureModalProps) => {
  const { t } = useTranslations()

  return (
    <Modal aria-labelledby="legal-disclosure-title" onClose={onClose} isOpen={isOpen}>
      <Modal.Header id="legal-disclosure-title" hasCloseButton>
        {t({ id: 'legalDisclosureModalTitle' })}
      </Modal.Header>
      <Modal.Content>
        <Grid container direction="column" spacing={2}>
          <Grid>
            <Chip color="info" label={t({ id: 'legalDisclosureLastUpdatedLabel' }, { date: t({ id: 'legalDisclosureLastUpdatedDate' }) })} />
          </Grid>
          <Grid>
            <Typography component="p" variant="body2">
              {t({ id: 'legalDisclosureBodyParagraph1' })}
            </Typography>
          </Grid>
          <Grid>
            <Typography component="p" variant="body2">
              {t({ id: 'legalDisclosureBodyParagraph2' })}
            </Typography>
          </Grid>
          <Grid>
            <Link href={EXTERNAL_URLS.TERMS_OF_USE} target="_blank" rel="noopener noreferrer" underline="always">
              {t({ id: 'termsOfUseLink' }, { terms: (chunks) => chunks })}
            </Link>
          </Grid>
        </Grid>
      </Modal.Content>
    </Modal>
  )
}
