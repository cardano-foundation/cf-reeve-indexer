import { useState } from 'react'

export const useOrganizationMode = () => {
  const [isEditMode, setIsEditMode] = useState(false)

  const activateEditMode = () => {
    setIsEditMode(true)
  }

  const activatePreviewMode = () => {
    setIsEditMode(false)
  }

  return {
    isEditMode,
    activateEditMode,
    activatePreviewMode
  }
}
