import { FormikHelpers } from 'formik'

import { ChartOfAccount } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types.ts'
import { ChartOfAccountFormValues } from 'modules/chart-of-accounts/components/ChartOfAccountForm/ChartOfAccountForm.types.ts'
import { useChartOfAccountForm } from 'modules/chart-of-accounts/hooks/useChartOfAccountForm.ts'
import { useDialogChartOfAccountsQueries } from 'modules/chart-of-accounts/hooks/useDialogChartOfAccountsQueries.ts'

interface DialogChartOfAccountState {
  chartOfAccount?: ChartOfAccount
}

interface DialogChartOfAccountHandlers {
  onCancel: () => void
  onConfirm: (values: ChartOfAccountFormValues, formikHelpers: FormikHelpers<ChartOfAccountFormValues>, isEditMode: boolean) => Promise<void>
}

export const useDialogChartOfAccount = (state: DialogChartOfAccountState, handlers: DialogChartOfAccountHandlers) => {
  const { chartOfAccount } = state
  const { onCancel, onConfirm } = handlers

  const { organisation, isFetching } = useDialogChartOfAccountsQueries()

  const isEditMode = Boolean(chartOfAccount?.customerCode)

  const { initialValues, handleFormSubmit } = useChartOfAccountForm({ chartOfAccount, organisation }, { onCancel, onConfirm }, isEditMode)

  return {
    initialValues,
    organisation,
    handleFormSubmit,
    isEditMode,
    isFetching
  }
}
