import { useLocationState } from 'hooks'
import { PublicTransactionsFormValues } from 'modules/public-transactions/components/PublicTransactionsForm/PublicTransactionsForm.types.ts'
import { usePublicTransactionsForm } from 'modules/public-transactions/hooks/usePublicTransactionsForm.ts'
import { usePublicTransactionsQueries } from 'modules/public-transactions/hooks/usePublicTransactionsQueries.ts'

export const usePublicTransactions = () => {
  const { state } = useLocationState<PublicTransactionsFormValues>()

  const { organisations, currencies, isFetching } = usePublicTransactionsQueries()

  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, initialValues, validationSchema, handleFormReset, handleFormSubmit } = usePublicTransactionsForm({
    organisations,
    locationState: state
  })

  const hasInitialValues = Boolean(state)

  return {
    currencies,
    dateFromMaxDate,
    dateFromMinDate,
    dateToMaxDate,
    dateToMinDate,
    initialValues,
    organisations,
    validationSchema,
    handleFormReset,
    handleFormSubmit,
    hasInitialValues,
    isFetching
  }
}
