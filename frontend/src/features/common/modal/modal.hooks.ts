import { useContext, useState } from 'react'

import { ModalContext } from './modal.context'

export const useModalContext = () => {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error('useModalContext must be used within a ModalContext')
  }

  return context
}

export const useModal = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleModalOpen = () => setIsOpen(true)

  const handleModalClose = () => setIsOpen(false)

  return { handleModalOpen, handleModalClose, isOpen }
}
