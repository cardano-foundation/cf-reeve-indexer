import { useCallback, useEffect, useState } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
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

interface TransactionsSnackbarState {
  hasImportedTransactions?: boolean
}

export const useTransactionsSnackbar = (state: TransactionsSnackbarState) => {
  const { hasImportedTransactions } = state

  const [snackbar, setSnackbar] = useState<SnackbarState>(DEFAULTS_SNACKBAR_STATE)

  const { t } = useTranslations()

  const { handleClose, showSnackbar, isSnackbarVisible } = useSnackbar()

  const handleSnackbarOpen = useCallback(
    (message: string, type: SnackbarType, hint?: string) => {
      setSnackbar({ message, type, hint })
      showSnackbar()
    },
    [showSnackbar]
  )

  useEffect(() => {
    if (hasImportedTransactions) {
      handleSnackbarOpen(t({ id: 'importRequestReceivedMessage' }), SnackbarType.SUCCESS, t({ id: 'importRequestReceivedHint' }))
    }
  }, [hasImportedTransactions])

  return {
    snackbar,
    handleSnackbarClose: handleClose,
    handleSnackbarOpen,
    isSnackbarVisible
  }
}
