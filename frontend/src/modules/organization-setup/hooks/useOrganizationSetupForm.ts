import { isAxiosError } from 'axios'
import { FormikHelpers } from 'formik'
import { useState } from 'react'

import { ApiError } from 'libs/api-connectors/backend-connector-lob/api/errors.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useFormOrganizationSetupValidation } from 'libs/form-kit/validations/useFormOrganizationSetupValidation.ts'
import { useUploadChartOfAccountsModel } from 'libs/models/chart-of-accounts/UploadChartOfAccountsModel.service'
import { useUploadCostCentersModel } from 'libs/models/cost-centers/UploadCostCentersModel.service.ts'
import { useUploadEventCodesModel } from 'libs/models/event-codes/UploadEventCodesModel.service.ts'
import { useUploadRefCodesModel } from 'libs/models/ref-codes/UploadEventCodesModel.service.ts'
import { useUploadVatCodesModel } from 'libs/models/vat-codes/UploadVatCodesModel.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { OrganizationSetupFormValues, SetupType } from 'modules/organization-setup/components/OrganizationSetupForm/OrganizationSetupForm.types.ts'
import { useOrganizationSetupSnackbar } from 'modules/organization-setup/hooks/useOrganizationSetupSnackbar.ts'

export type ErrorDetail = Pick<ApiError, 'detail' | 'status' | 'title'>

export type WarningDetail = Pick<ApiError, 'detail' | 'status' | 'title'> & { row: number }

interface OrganizationSetupFormHandlers {
  onDialogOrganizationSetupCancel: () => void
  onSnackbarOpen: ReturnType<typeof useOrganizationSetupSnackbar>['handleSnackbarOpen']
}

export const useOrganizationSetupForm = (handlers: OrganizationSetupFormHandlers) => {
  const { onDialogOrganizationSetupCancel, onSnackbarOpen } = handlers

  const [apiErrors, setApiErrors] = useState<ErrorDetail[] | null>(null)
  const [apiWarnings, setApiWarnings] = useState<WarningDetail[] | null>(null)

  const { t } = useTranslations()

  const selectedOrganisation = useSelectedOrganisation()

  const { triggerUploadChartOfAccounts } = useUploadChartOfAccountsModel()
  const { triggerUploadCostCenters } = useUploadCostCentersModel()
  const { triggerUploadEventCodes } = useUploadEventCodesModel()
  const { triggerUploadRefCodes } = useUploadRefCodesModel()
  const { triggerUploadVatCodes } = useUploadVatCodesModel()

  const initialValues: OrganizationSetupFormValues = {
    setupType: SetupType.CHART_OF_ACCOUNTS,
    file: null
  }

  const validationSchema = useFormOrganizationSetupValidation()

  const handleFormSubmit = async (values: OrganizationSetupFormValues, formikHelpers: FormikHelpers<OrganizationSetupFormValues>) => {
    if (!values.file) return

    const formData = new FormData()

    formData.append('file', values.file)

    const payload = {
      parameters: { organisationId: selectedOrganisation },
      body: formData
    }

    const triggers = {
      [SetupType.CHART_OF_ACCOUNTS]: triggerUploadChartOfAccounts,
      [SetupType.EVENT_CODES]: triggerUploadEventCodes,
      [SetupType.COST_CENTERS]: triggerUploadCostCenters,
      [SetupType.VAT_CODES]: triggerUploadVatCodes,
      [SetupType.REFERENCE_CODES]: triggerUploadRefCodes
    } as const

    setApiErrors(null)
    setApiWarnings(null)

    try {
      await triggers[values.setupType](payload, {
        onSuccess: (response) => {
          console.log({ response })

          formikHelpers.resetForm()
          setApiWarnings(response ? response.reduce((acc, { error }, index) => (error ? [...acc, { ...error, row: index + 1 }] : acc), [] as WarningDetail[]) : null)
          onSnackbarOpen(t({ id: 'importSuccessMessage' }), SnackbarType.SUCCESS, t({ id: 'importSuccessHint' }))
        },
        onError: (error) => {
          if (isAxiosError<ApiError[] | ApiError>(error)) {
            if (error.status && error.status === 400) {
              setApiErrors(error.response ? (Array.isArray(error.response.data) ? error.response.data : [error.response.data]) : null)
            }
          }
        }
      })
    } finally {
      onDialogOrganizationSetupCancel()
    }
  }

  return {
    apiErrors,
    apiWarnings,
    initialValues,
    validationSchema,
    handleFormSubmit
  }
}
