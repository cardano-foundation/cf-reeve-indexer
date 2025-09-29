import { SnackbarCloseReason } from '@mui/material'
import { SyntheticEvent, useState } from 'react'

export enum SnackbarActionType {
  APPROVE = 'approve',
  PUBLISH = 'publish',
  REJECT = 'reject',
  RECONCILE = 'reconcile'
}

export const useSnackbar = () => {
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false)
  const [snackbarActionType, setSnackbarActionType] = useState<SnackbarActionType>()

  const showSnackbar = () => {
    setIsSnackbarVisible(true)
  }

  const handleClose = (_event: SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return
    }

    setIsSnackbarVisible(false)
  }

  return {
    isSnackbarVisible,
    showSnackbar,
    handleClose,
    snackbarActionType,
    setSnackbarActionType
  }
}
