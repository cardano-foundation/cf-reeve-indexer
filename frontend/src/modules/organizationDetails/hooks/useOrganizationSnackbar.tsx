import { useState } from 'react'

import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar'

const DEFAULTS_SNACKBAR_STATE = {
  hint: '',
  message: '',
  type: SnackbarType.LOADING
} as const

interface SnackbarState {
  hint?: string
  message: string
  type: SnackbarType
}

export const useOrgnizationSnackbar = () => {
  const [snackbar, setSnackbar] = useState<SnackbarState>(DEFAULTS_SNACKBAR_STATE)

  const { isSnackbarVisible, showSnackbar, handleClose } = useSnackbar()

  return {
    isSnackbarVisible,
    showSnackbar,
    handleClose,
    snackbar,
    setSnackbar
  }
}
