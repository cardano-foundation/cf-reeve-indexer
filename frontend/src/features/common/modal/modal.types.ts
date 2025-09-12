import type { DialogActionsProps, DialogContentProps, DialogProps, DialogTitleProps } from 'features/mui/base'

export interface ModalHeaderProps extends DialogTitleProps {
  hasCloseButton?: boolean
}

export interface ModalContentProps extends DialogContentProps {
  isPreviewMode?: boolean
}

export interface ModalActionsProps extends DialogActionsProps {}

export interface ModalContextProps {
  isOpen: boolean
  onClose: () => void
}

export interface ModalProps extends Omit<DialogProps, 'onClose' | 'open'> {
  isOpen: boolean
  onClose: () => void
}
