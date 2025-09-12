import { useState } from 'react'

import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'

const DEFAULTS_SNACKBAR_STATE = {
  hint: '',
  message: '',
  type: SnackbarType.LOADING
} as const

export interface SnackbarState {
  hint?: string
  message: string
  type: SnackbarType
}

export const useChartOfAccountsSnackbar = () => {
  const [snackbar, setSnackbar] = useState<SnackbarState>(DEFAULTS_SNACKBAR_STATE)

  const { handleClose, showSnackbar, isSnackbarVisible } = useSnackbar()

  const handleSnackbarOpen = (message: string, type: SnackbarType, hint?: string) => {
    setSnackbar({ message, type, hint })
    showSnackbar()
  }

  return {
    snackbar,
    handleSnackbarClose: handleClose,
    handleSnackbarOpen,
    isSnackbarVisible
  }
}
