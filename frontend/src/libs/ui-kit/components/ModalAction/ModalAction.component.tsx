import { SxProps } from '@mui/material'
import Box from '@mui/material/Box'
import { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Danger } from 'iconsax-react'
import { ReactElement, ReactNode, useEffect, useState } from 'react'

import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { ButtonClose } from 'libs/ui-kit/components/ButtonClose/ButtonClose.component.tsx'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { theme } from 'libs/ui-kit/theme/theme.ts'

export enum ModalButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TEXT = 'text'
}

export interface ModalActionProps extends Partial<DialogProps> {
  message?: string
  primaryActionLabel?: string
  primaryActionOnClick?: () => void
  secondaryActionLabel?: string
  secondaryActionOnClick?: () => void
  isModalDisabled?: boolean
  isPrimaryButtonDisabled?: boolean
  children?: ReactNode
  renderButton?: ({ handleClickOpen, isModalDisabled }: { handleClickOpen: (event: React.MouseEvent<HTMLButtonElement>) => void; isModalDisabled?: boolean }) => ReactElement
  sx?: SxProps<Theme>
  warning?: string
  hasButtonClose?: boolean
  isOpen?: boolean
}

export const ModalAction = ({
  message,
  primaryActionLabel,
  primaryActionOnClick,
  secondaryActionLabel,
  secondaryActionOnClick,
  isModalDisabled,
  isPrimaryButtonDisabled,
  children,
  renderButton,
  warning,
  hasButtonClose,
  isOpen,
  ...props
}: ModalActionProps) => {
  const [open, setOpen] = useState(isOpen ?? false)

  useEffect(() => {
    isOpen && setOpen(isOpen)
  }, [isOpen])

  const handleClickOpen = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.currentTarget.blur()
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    secondaryActionOnClick && secondaryActionOnClick()
  }

  const handleOnClickPrimary = () => {
    primaryActionOnClick && primaryActionOnClick()
    handleClose()
  }

  const handleOnClickSecondary = () => {
    secondaryActionOnClick && secondaryActionOnClick()
    handleClose()
  }

  return (
    <>
      {renderButton && renderButton({ handleClickOpen, isModalDisabled })}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        disableScrollLock={true}
        fullWidth
        {...props}
      >
        {hasButtonClose && (
          <Box alignItems="center" display="flex" justifyContent="flex-end">
            <ButtonClose onClick={handleClose} />
          </Box>
        )}
        <DialogContent sx={{ padding: 3, backgroundColor: theme.palette.common.white }}>
          {warning && (
            <Box pb={4}>
              <Alert icon={<Danger />} severity="warning">
                {warning}
              </Alert>
            </Box>
          )}
          {message && (
            <DialogContentText id="alert-dialog-description">
              <Typography variant="body1" component="span" color={theme.palette.text.primary}>
                {message}
              </Typography>
            </DialogContentText>
          )}
          {children}
        </DialogContent>
        <DialogActions sx={{ padding: 2, backgroundColor: theme.palette.common.white }}>
          {secondaryActionLabel && <ButtonText onClick={handleOnClickSecondary}>{secondaryActionLabel}</ButtonText>}
          {primaryActionLabel && (
            <ButtonPrimary onClick={handleOnClickPrimary} disabled={isPrimaryButtonDisabled}>
              {primaryActionLabel}
            </ButtonPrimary>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
