import { ButtonClose } from 'features/common'
import { Box, Typography } from 'features/mui/base'

import { ModalContext } from './modal.context'
import { useModalContext } from './modal.hooks'
import { ModalStyled, ModalActionsStyled, ModalContentStyled, ModalTitleStyled } from './modal.styles'
import type { ModalActionsProps, ModalContentProps, ModalHeaderProps, ModalProps } from './modal.types'

const ModalHeader = ({ children, hasCloseButton = false, subtitle, ...props }: ModalHeaderProps) => {
  const { onClose } = useModalContext()

  return (
    <Box alignItems="center" display="flex" justifyContent="space-between" pt={2} pr={2} pb={1} pl={{ xs: 2, sm: 3 }}>
      <Box display="flex" flex="1 1 auto" flexDirection="column" gap={0.25} minWidth={0}>
        <ModalTitleStyled id="dialog-title" noWrap {...props}>
          {children}
        </ModalTitleStyled>
        {subtitle && <Typography variant="body2">{subtitle}</Typography>}
      </Box>
      {hasCloseButton && <ButtonClose onClick={onClose} />}
    </Box>
  )
}
const ModalContent = ({ children, isPreviewMode, ...props }: ModalContentProps) => {
  return (
    <Box display="flex" position="relative" overflow="hidden auto">
      <ModalContentStyled {...props}>{children}</ModalContentStyled>
    </Box>
  )
}
const ModalActions = ({ children, ...props }: ModalActionsProps) => {
  return <ModalActionsStyled {...props}>{children}</ModalActionsStyled>
}

export const Modal = ({ children, maxWidth = 'sm', onClose, isOpen, ...props }: ModalProps) => {
  const handleClose = (_event: React.MouseEvent<HTMLButtonElement>, reason: string) => {
    if (reason === 'backdropClick') {
      return
    }

    onClose()
  }

  return (
    <ModalStyled maxWidth={maxWidth} onClose={handleClose} open={isOpen} {...props}>
      <ModalContext.Provider value={{ isOpen, onClose }}>{children}</ModalContext.Provider>
    </ModalStyled>
  )
}

Modal.Header = ModalHeader
Modal.Content = ModalContent
Modal.Actions = ModalActions
