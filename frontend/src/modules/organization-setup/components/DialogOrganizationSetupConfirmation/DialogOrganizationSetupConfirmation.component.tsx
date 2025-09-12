import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogActions } from 'libs/ui-kit/components/DialogActions/DialogActions.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'
import { DialogContentText } from 'libs/ui-kit/components/DialogContentText/DialogContentText.component.tsx'

interface DialogOrganizationSetupConfirmationProps {
  onCancel: () => void
  isOpen: boolean
}

export const DialogOrganizationSetupConfirmation = ({ onCancel, isOpen }: DialogOrganizationSetupConfirmationProps) => {
  const { t } = useTranslations()

  return (
    <Dialog aria-label={t({ id: 'dialogOrganizationSetupTitle' })} aria-describedby="dialog-alert-description" disableScrollLock={true} open={isOpen} onClose={onCancel}>
      <DialogContent>
        <DialogContentText component="p" id="dialog-alert-description" variant="body1">
          {t({ id: 'dialogOrganizationSetupMessage' })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <ButtonText onClick={onCancel}>{t({ id: 'cancel' })}</ButtonText>
        <ButtonPrimary form="organization-setup-form" type="submit">
          {t({ id: 'confirm' })}
        </ButtonPrimary>
      </DialogActions>
    </Dialog>
  )
}
