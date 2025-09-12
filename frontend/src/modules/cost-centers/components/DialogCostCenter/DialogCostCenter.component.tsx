import { useTheme } from '@mui/material'
import { DialogProps as DialogPropsMUI } from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'

import { CostCenterResponse, GetCostCentersResponse200 } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogActions } from 'libs/ui-kit/components/DialogActions/DialogActions.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'
import { CostCenterForm } from 'modules/cost-centers/components/CostCenterForm/CostCenterForm.component.tsx'
import { CostCenterFormValues } from 'modules/cost-centers/components/CostCenterForm/CostCenterForm.types.ts'
import { useDialogCostCenter } from 'modules/cost-centers/hooks/useDialogCostCenter.ts'

interface DialogCostCenterProps extends DialogPropsMUI {
  costCenter?: CostCenterResponse
  costCenters: GetCostCentersResponse200
  onCancel: () => void
  onConfirm: (values: CostCenterFormValues, isEditMode: boolean) => Promise<void>
}

export const DialogCostCenter = ({ costCenter, costCenters, onCancel, onConfirm, open, ...props }: DialogCostCenterProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { initialValues, organisation, handleFormSubmit, isEditMode, isFetching } = useDialogCostCenter({ costCenter }, { onCancel, onConfirm })

  return (
    <Dialog aria-describedby="dialog-cost-center-description" aria-labelledby="dialog-cost-center-title" maxWidth="sm" open={open} disableScrollLock fullWidth {...props}>
      <DialogTitle component="h2" variant="body2" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        {t({ id: isEditMode ? 'editCostCenter' : 'addCostCenter' })}
      </DialogTitle>
      <DialogContent
        sx={{
          '&&': {
            minWidth: 'initial',
            pt: 2.5
          }
        }}
      >
        <CostCenterForm
          initialValues={initialValues}
          costCenters={costCenters}
          organisation={organisation}
          onSubmit={handleFormSubmit}
          isFetching={isFetching}
          isEditMode={isEditMode}
        />
      </DialogContent>
      <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
        <ButtonText onClick={onCancel}>{t({ id: 'cancel' })}</ButtonText>
        <ButtonPrimary form="cost-center-form" type="submit">
          {t({ id: 'save' })}
        </ButtonPrimary>
      </DialogActions>
    </Dialog>
  )
}
