import { FormikProps } from 'formik'

import { OrganisationApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types'

import { useOrganizationMode } from './useOrganizationMode'

export const useOrganizationControls = (mode: ReturnType<typeof useOrganizationMode>, formikRef: React.RefObject<FormikProps<OrganisationApiResponse>>) => {
  const handleCancel = () => {
    formikRef.current?.resetForm()
    mode.activatePreviewMode()
  }
  const handleSave = () => {
    formikRef.current?.submitForm()
  }

  const handleActivateEditMode = () => {
    mode.activateEditMode()
  }

  return {
    handleSave,
    handleCancel,
    handleActivateEditMode
  }
}
