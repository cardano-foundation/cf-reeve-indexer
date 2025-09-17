import { FormikProps } from 'formik'
import { useRef } from 'react'

import { OrganisationApiResponse, UpdateOrganisationDTO } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetOrganisationModel } from 'libs/models/organisation-model/GetOrganisation/GetOrganisations.service'
import { useUpdateOrganisationModel } from 'libs/models/organisation-model/UpdateOrganisation/UpdateOrganisation.service'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component'

import { useOrganizationControls } from './useOrganizationControls'
import { useOrganizationMode } from './useOrganizationMode'
import { useOrgnizationSnackbar } from './useOrganizationSnackbar'

export const useOrganization = () => {
  const { t } = useTranslations()
  const formikRef = useRef<FormikProps<OrganisationApiResponse>>(null)
  const selectedOrganisation = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'

  const { organisation, isFetching } = useGetOrganisationModel({ id: selectedOrganisation })
  const { triggerUpdateOrganisation } = useUpdateOrganisationModel()

  const snack = useOrgnizationSnackbar()
  const mode = useOrganizationMode()
  const controls = useOrganizationControls(mode, formikRef)

  const handleFormSubmit = async (values: OrganisationApiResponse) => {
    const payload: UpdateOrganisationDTO = {
      id: values.id,
      name: values.name,
      adminEmail: values.adminEmail,
      phoneNumber: values.phoneNumber,
      websiteUrl: values.websiteUrl,
      city: values.city,
      postCode: values.postCode,
      province: values.province,
      address: values.address,

      // Readonly fields that we have to pass with POST request. Required by BE
      currencyId: values.currencyId,
      reportCurrencyId: values.reportCurrencyId
    }
    try {
      await triggerUpdateOrganisation(payload)
      mode.activatePreviewMode()
      snack.setSnackbar({ message: t({ id: 'organisationUpdateSuccess' }), type: SnackbarType.SUCCESS })
    } catch (error) {
      snack.setSnackbar({ message: t({ id: 'organisationUpdateError' }), type: SnackbarType.INFO })
    } finally {
      snack.showSnackbar()
    }
  }

  return {
    formikRef,
    initialValues: organisation,
    organisation: organisation,
    handleFormSubmit,
    isFetching,
    mode,
    controls,
    snackbar: {
      ...snack.snackbar,
      isSnackbarVisible: snack.isSnackbarVisible,
      handleClose: snack.handleClose
    }
  }
}
