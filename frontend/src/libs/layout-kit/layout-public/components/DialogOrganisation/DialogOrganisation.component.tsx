import Box from '@mui/material/Box'
import DialogTitle from '@mui/material/DialogTitle'
import ListItemText from '@mui/material/ListItemText'

import { cardanoFoundationLogo } from 'assets/icons'
import {
  ListItemButtonStyled,
  ListItemIconStyled,
  ListItemStyled,
  ListStyled,
  OrganisationLogoStyled
} from 'libs/layout-kit/layout-public/components/DialogOrganisation/DialogOrganisation.styles.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonClose } from 'libs/ui-kit/components/ButtonClose/ButtonClose.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'

interface DialogOrganisationProps {
  onClose: () => void
  isOpen: boolean
}

export const DialogOrganisation = ({ onClose, isOpen }: DialogOrganisationProps) => {
  const { t } = useTranslations()

  return (
    <Dialog aria-labelledby="dialog-alert-title" maxWidth="sm" open={isOpen} fullWidth>
      <Box alignItems="center" display="flex" justifyContent="space-between" pt={2} pr={2} pb={1} pl={3}>
        <DialogTitle id="dialog-alert-title" sx={{ p: 0 }}>
          {t({ id: 'organization' })}
        </DialogTitle>
        <ButtonClose onClick={onClose} />
      </Box>
      <DialogContent>
        <ListStyled>
          <ListItemStyled>
            <ListItemButtonStyled selected onClick={onClose}>
              <ListItemIconStyled>
                <OrganisationLogoStyled alt="Cardano Foundation" src={cardanoFoundationLogo} />
              </ListItemIconStyled>
              <ListItemText primary="Cardano Foundation" />
            </ListItemButtonStyled>
          </ListItemStyled>
        </ListStyled>
      </DialogContent>
    </Dialog>
  )
}
