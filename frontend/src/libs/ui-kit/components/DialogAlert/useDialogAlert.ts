import { useState } from 'react'

export const useDialogAlert = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleDialogClose = () => {
    setIsOpen(false)
  }

  const handleDialogOpen = () => {
    setIsOpen(true)
  }

  return {
    isOpen,
    handleDialogClose,
    handleDialogOpen
  }
}
