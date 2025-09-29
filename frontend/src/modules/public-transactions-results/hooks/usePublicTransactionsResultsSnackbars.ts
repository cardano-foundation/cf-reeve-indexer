import { useEffect, useState } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'

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

interface PublicTransactionsResultsSnackbarsState {
  isFetching: boolean
}

export const usePublicTransactionsResultsSnackbars = (state: PublicTransactionsResultsSnackbarsState) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>(DEFAULTS_SNACKBAR_STATE)

  const { t } = useTranslations()

  const { isFetching } = state

  const { isSnackbarVisible, showSnackbar, handleClose } = useSnackbar()

  useEffect(() => {
    let timeoutId: number | undefined

    if (isFetching) {
      setSnackbar({ hint: t({ id: 'loadingHint' }), message: t({ id: 'publicTransactionsResultsLoadingMessage' }), type: SnackbarType.LOADING })
      showSnackbar()
    } else {
      timeoutId = window.setTimeout(() => {
        setSnackbar({ message: t({ id: 'publicTransactionResultsSuccessMessage' }), type: SnackbarType.SUCCESS })
        showSnackbar()
      }, 1250)
    }

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [isFetching])

  return {
    snackbar,
    handleClose,
    isSnackbarVisible
  }
}
