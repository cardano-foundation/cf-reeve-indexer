import { AlertProps as AlertPropsMUI } from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { DialogProps as DialogPropsMUI } from '@mui/material/Dialog'

import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogActions } from 'libs/ui-kit/components/DialogActions/DialogActions.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'
import { DialogContentText } from 'libs/ui-kit/components/DialogContentText/DialogContentText.component.tsx'

interface DialogAlert extends AlertPropsMUI {}

interface DialogAlertProps extends DialogPropsMUI {
  alert?: DialogAlert
  cancelLabel: string
  confirmLabel: string
  message: string
  onCancel: () => void
  onConfirm: () => void
}

export const DialogAlert = ({ alert, cancelLabel, confirmLabel, message, open, onCancel, onClose, onConfirm, ...props }: DialogAlertProps) => {
  const { children, severity, variant, ...alertProps } = alert ?? {}

  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="dialog-alert-title" aria-describedby="dialog-alert-description" disableScrollLock={true} {...props}>
      <DialogContent>
        {alert && (
          <Box mb={2}>
            <Alert severity={severity} variant={variant} {...alertProps}>
              {children}
            </Alert>
          </Box>
        )}
        <DialogContentText component="p" id="dialog-alert-description" variant="body1">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <ButtonText onClick={onCancel}>{cancelLabel}</ButtonText>
        <ButtonPrimary onClick={onConfirm}>{confirmLabel}</ButtonPrimary>
      </DialogActions>
    </Dialog>
  )
}
