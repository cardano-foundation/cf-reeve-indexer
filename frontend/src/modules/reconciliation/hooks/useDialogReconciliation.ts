import { ReconciliationFormValues } from 'modules/reconciliation/components/ReconciliationForm/ReconciliationForm.types.ts'
import { useReconciliationDialogForm } from 'modules/reconciliation/hooks/useReconciliationDialogForm.ts'
import { useReconciliationDialogQueries } from 'modules/reconciliation/hooks/useReconciliationDialogQueries.ts'

interface DialogReconciliationHandlers {
  onCancel: () => void
  onConfirm: (values: ReconciliationFormValues) => Promise<void>
}

export const useDialogReconciliation = (handlers: DialogReconciliationHandlers) => {
  const { onCancel, onConfirm } = handlers

  const { organisations, isFetching } = useReconciliationDialogQueries()

  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, initialValues, validationSchema, handleFormSubmit } = useReconciliationDialogForm(
    { organisations },
    { onCancel, onConfirm }
  )

  return {
    dateFromMaxDate,
    dateFromMinDate,
    dateToMaxDate,
    dateToMinDate,
    initialValues,
    organisations,
    validationSchema,
    handleFormSubmit,
    isFetching
  }
}
