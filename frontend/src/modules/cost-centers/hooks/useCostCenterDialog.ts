import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { CostCenterRequestParameters } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useCreateCostCenterModel } from 'libs/models/cost-centers/CreateCostCenterModel.service.ts'
import { useUpdateCostCenterModel } from 'libs/models/cost-centers/UpdateCostCentersModel.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'
import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { CostCenterFormValues } from 'modules/cost-centers/components/CostCenterForm/CostCenterForm.types.ts'
import { SnackbarState } from 'modules/cost-centers/hooks/useCostCenters.ts'

interface CostCeterDialogHandlers {
  onCostCenterSelectionReset: () => void
  setSnackbar: (snackbar: SnackbarState) => void
  showSnackbar: () => void
}

export const useCostCenterDialog = (handlers: CostCeterDialogHandlers) => {
  const queryClient = useQueryClient()
  const { t } = useTranslations()
  const selectedOrganisation = useSelectedOrganisation()
  const { onCostCenterSelectionReset, setSnackbar, showSnackbar } = handlers

  const { handleDialogClose, handleDialogOpen, isOpen } = useDialogAlert()

  const { triggerCreateCostCenter } = useCreateCostCenterModel()
  const { triggerUpdateCostCenter } = useUpdateCostCenterModel()

  const handleDialogConfirm = async (values: CostCenterFormValues, isEditMode: boolean) => {
    const payload: Partial<CostCenterRequestParameters> = {
      organisationId: selectedOrganisation,
      customerCode: values.code,
      name: values.description,
      parentCustomerCode: values.hasParent ? values.parentCode : '',
      active: values.active
    }

    const createOrUpdateCostCenter = isEditMode ? triggerUpdateCostCenter : triggerCreateCostCenter

    await createOrUpdateCostCenter(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['COST_CENTERS'] })
        setSnackbar({
          message: isEditMode ? t({ id: 'costCenterUpdateSuccess' }) : t({ id: 'costCenterCreateSuccess' }),
          type: SnackbarType.SUCCESS
        })
        showSnackbar()
      },
      onError: () => {
        setSnackbar({
          message: isEditMode ? t({ id: 'costCenterUpdateError' }) : t({ id: 'costCenterCreateError' }),
          type: SnackbarType.INFO
        })
        showSnackbar()
      }
    })
  }

  useEffect(() => {
    if (!isOpen) {
      onCostCenterSelectionReset()
    }
  }, [onCostCenterSelectionReset, isOpen])

  return {
    handleCostCenterDialogClose: handleDialogClose,
    handleCostCenterDialogConfirm: handleDialogConfirm,
    handleCostCenterDialogOpen: handleDialogOpen,
    isCostCenterDialogOpen: isOpen
  }
}
