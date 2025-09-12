import { FormikHelpers } from 'formik'

import { VatCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.types.ts'
import { formatNumber } from 'libs/utils/format.ts'
import { VatCodeFormValues } from 'modules/vat-codes/components/VatCodeForm/VatCodeForm.types.ts'

interface VatCodeFormState {
  vatCode?: VatCodeResponse
  isEditMode: boolean
}

interface VatCodeFormHandlers {
  onCancel: () => void
  onConfirm: (values: VatCodeFormValues, formikHelpers: FormikHelpers<VatCodeFormValues>, isEditMode: boolean) => Promise<void>
}

export const useVatCodeForm = (state: VatCodeFormState, handlers: VatCodeFormHandlers) => {
  const { vatCode, isEditMode } = state
  const { onCancel, onConfirm } = handlers

  const initialValues: VatCodeFormValues = {
    code: vatCode?.customerCode ?? '',
    description: vatCode?.description ?? '',
    countryCode: vatCode?.countryCode ?? '',
    rate: vatCode ? formatNumber(parseFloat(vatCode.rate) * 100) : '',
    active: Boolean(vatCode?.active)
  }

  const handleFormSubmit = async (values: VatCodeFormValues, formikHelpers: FormikHelpers<VatCodeFormValues>) => {
    await onConfirm(values, formikHelpers, isEditMode)
    onCancel()
  }

  return { initialValues, handleFormSubmit }
}
