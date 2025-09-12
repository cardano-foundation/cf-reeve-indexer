import { FormikHelpers } from 'formik'

import { RefCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi.types.ts'
import { RefCodeFormValues } from 'modules/event-ref-codes/components/RefCodeDetailsForm/RefCodeDetailsForm.types.ts'

interface RefCodeFormHandlers {
  onCancel: () => void
  onConfirm: (values: RefCodeFormValues, formikHelpers: FormikHelpers<RefCodeFormValues>, isEditMode: boolean) => Promise<void>
}

interface RefCodeFormState {
  refCode?: RefCodeResponse
}

export const useRefCodeForm = (state: RefCodeFormState, handlers: RefCodeFormHandlers, isEditMode: boolean) => {
  const { refCode } = state
  const { onCancel, onConfirm } = handlers

  const initialValues: RefCodeFormValues = {
    description: refCode?.description ?? '',
    referenceCode: refCode?.referenceCode ?? '',
    parentReferenceCode: refCode?.parent?.referenceCode ?? '',
    hasParent: Boolean(refCode?.parent) || false,
    active: refCode?.active ?? false
  }

  const handleFormSubmit = async (values: RefCodeFormValues, formikHelpers: FormikHelpers<RefCodeFormValues>) => {
    await onConfirm(values, formikHelpers, isEditMode)
    onCancel()
  }

  return { initialValues, handleFormSubmit }
}
