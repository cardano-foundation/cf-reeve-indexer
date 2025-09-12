import { FormikHelpers } from 'formik'

import { VatCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.types.ts'
import { VatCodeFormValues } from 'modules/vat-codes/components/VatCodeForm/VatCodeForm.types.ts'
import { useVatCodeForm } from 'modules/vat-codes/hooks/useVatCodeForm.ts'

interface DialogVatCodesState {
  vatCode?: VatCodeResponse
}

interface DialogVatCodesHandlers {
  onCancel: () => void
  onConfirm: (values: VatCodeFormValues, formikHelpers: FormikHelpers<VatCodeFormValues>, isEditMode: boolean) => Promise<void>
}

export const useDialogVatCode = (state: DialogVatCodesState, handlers: DialogVatCodesHandlers) => {
  const { vatCode } = state
  const { onCancel, onConfirm } = handlers

  const isEditMode = Boolean(vatCode?.customerCode)

  const { initialValues, handleFormSubmit } = useVatCodeForm({ vatCode, isEditMode }, { onCancel, onConfirm })

  return {
    initialValues,
    handleFormSubmit,
    isEditMode
  }
}
