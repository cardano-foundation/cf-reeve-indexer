import { useLocationState } from 'hooks'
import { useTransactionsSnackbar } from 'modules/transactions/hooks/useTransactionsSnackbar.ts'

export const useTransactions = () => {
  const { state } = useLocationState<{ hasImportedTransactions: boolean }>()

  const { hasImportedTransactions } = state ?? {}

  const { snackbar, handleSnackbarClose, isSnackbarVisible } = useTransactionsSnackbar({ hasImportedTransactions })

  return { snackbar, handleSnackbarClose, isSnackbarVisible }
}
