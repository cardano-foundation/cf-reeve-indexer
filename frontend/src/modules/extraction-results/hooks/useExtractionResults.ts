import { useLocationState } from 'hooks'
import { ExtractionFormValues } from 'modules/extraction/components/ExtractionForm/ExtractionForm.types.ts'
import { useExtractionResultsQueries } from 'modules/extraction-results/hooks/useExtractionResultsQueries.ts'
import { useExtractionResultsSnackbars } from 'modules/extraction-results/hooks/useExtractionResultsSnackbars.ts'

export const useExtractionResults = () => {
  const { state } = useLocationState<ExtractionFormValues>()

  const { transactions, isFetching } = useExtractionResultsQueries({ locationState: state })

  const { snackbar, isSnackbarVisible, handleClose } = useExtractionResultsSnackbars({ isFetching })

  const { accountCode, accountSubtype, accountType, costCenter, dateFrom, dateTo, project } = state ?? {}

  return {
    accountCode,
    accountSubtype,
    accountType,
    costCenter,
    dateFrom,
    dateTo,
    project,
    snackbar,
    transactions,
    handleClose,
    isFetching,
    isSnackbarVisible
  }
}
