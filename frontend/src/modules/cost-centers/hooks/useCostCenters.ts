import { useState } from 'react'

import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { useCostCenterDialog } from 'modules/cost-centers/hooks/useCostCenterDialog.ts'
import { useCostCentersQueries } from 'modules/cost-centers/hooks/useCostCentersQueries.ts'
import { useCostCentersSelection } from 'modules/cost-centers/hooks/useCostCentersSelection.ts'

export interface SnackbarState {
  hint?: string
  message: string
  type: SnackbarType
}

const DEFAULTS_SNACKBAR_STATE = {
  hint: '',
  message: '',
  type: SnackbarType.LOADING
} as const

export const useCostCenters = () => {
  const { costCenters, hasCostCenters, isFetching } = useCostCentersQueries()

  const { isSnackbarVisible, showSnackbar, handleClose } = useSnackbar()
  const [snackbar, setSnackbar] = useState<SnackbarState>(DEFAULTS_SNACKBAR_STATE)

  const { costCenter, handleCostCenterSelection, handleCostCenterSelectionReset } = useCostCentersSelection({ costCenters })

  const { handleCostCenterDialogClose, handleCostCenterDialogConfirm, handleCostCenterDialogOpen, isCostCenterDialogOpen } = useCostCenterDialog({
    onCostCenterSelectionReset: handleCostCenterSelectionReset,
    setSnackbar,
    showSnackbar
  })

  const handleCostCenterEdit = (id: string) => {
    handleCostCenterSelection(id)
    handleCostCenterDialogOpen()
  }

  return {
    costCenter,
    costCenters,
    handleCostCenterDialogClose,
    handleCostCenterDialogConfirm,
    handleCostCenterDialogOpen,
    handleCostCenterEdit,
    hasCostCenters,
    isCostCenterDialogOpen,
    isFetching,
    snackbar: {
      isSnackbarVisible,
      handleClose,
      showSnackbar,
      setSnackbar,
      snackbar
    }
  }
}
