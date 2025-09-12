import { useLocationState } from 'hooks'
import { ExtractionFormValues } from 'modules/extraction/components/ExtractionForm/ExtractionForm.types.ts'
import { useExtractionForm } from 'modules/extraction/hooks/useExtractionForm.ts'
import { useExtractionQueries } from 'modules/extraction/hooks/useExtractionQueries.ts'

export const useExtraction = () => {
  const { state } = useLocationState<ExtractionFormValues>()

  const { organisationChartTypes, organisationCostCenters, organisationProjects, organisations, isFetching } = useExtractionQueries()

  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, initialValues, validationSchema, handleFormReset, handleFormSubmit } = useExtractionForm({
    organisations,
    locationState: state
  })

  const hasInitialValues = Boolean(state)

  return {
    dateFromMaxDate,
    dateFromMinDate,
    dateToMaxDate,
    dateToMinDate,
    initialValues,
    organisationChartTypes,
    organisationCostCenters,
    organisationProjects,
    organisations,
    validationSchema,
    handleFormReset,
    handleFormSubmit,
    hasInitialValues,
    isFetching
  }
}
