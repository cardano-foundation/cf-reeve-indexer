import { FormikHelpers } from 'formik'

import { RefCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi.types.ts'
import { RefCodeFormValues } from 'modules/event-ref-codes/components/RefCodeDetailsForm/RefCodeDetailsForm.types.ts'
import { useRefCodeForm } from 'modules/event-ref-codes/hooks/useRefCodeForm.ts'
import { useRefCodesQueries } from 'modules/event-ref-codes/hooks/useRefCodesQueries.ts'

interface useDialogRefCodesState {
  refCode?: RefCodeResponse
}

interface useDialogRefCodesHandlers {
  onCancel: () => void
  onConfirm: (values: RefCodeFormValues, formikHelpers: FormikHelpers<RefCodeFormValues>, isEditMode: boolean) => Promise<void>
}

export const useDialogRefCodes = (state: useDialogRefCodesState, handlers: useDialogRefCodesHandlers) => {
  const { refCode } = state
  const { onCancel, onConfirm } = handlers

  const { refCodes, isFetching } = useRefCodesQueries()

  const isEditMode = Boolean(refCode?.referenceCode)

  const { initialValues, handleFormSubmit } = useRefCodeForm({ refCode }, { onCancel, onConfirm }, isEditMode)

  const refCodesOptions = refCodes
    .map((ref) => ({
      value: ref.referenceCode,
      name: `${ref.referenceCode} - ${ref.description}`
    }))
    .filter((ref) => ref.value !== refCode?.referenceCode)
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    initialValues,
    refCodes,
    refCodesOptions,
    handleFormSubmit,
    isEditMode,
    isFetching
  }
}
