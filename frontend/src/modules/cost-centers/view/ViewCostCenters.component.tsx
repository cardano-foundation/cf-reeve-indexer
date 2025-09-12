import Box from '@mui/material/Box'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { DialogCostCenter } from 'modules/cost-centers/components/DialogCostCenter/DialogCostCenter.component.tsx'
import { TableCostCenters } from 'modules/cost-centers/components/TableCostCenters/TableCostCenters.component.tsx'
import { useCostCenters } from 'modules/cost-centers/hooks/useCostCenters.ts'

export const ViewCostCenters = () => {
  const { t } = useTranslations()

  const {
    costCenter,
    costCenters,
    handleCostCenterDialogClose,
    handleCostCenterDialogConfirm,
    handleCostCenterDialogOpen,
    handleCostCenterEdit,
    hasCostCenters,
    isCostCenterDialogOpen,
    isFetching,
    snackbar
  } = useCostCenters()

  return (
    <>
      <LayoutAuth.Header alignItems="center" justifyContent="space-between">
        <LayoutAuth.Header.Details title={t({ id: 'costCentersViewTitle' })} />
        {hasCostCenters && !isFetching && (
          <Box alignItems="center" display="flex" gap={1}>
            <ButtonPrimary onClick={handleCostCenterDialogOpen} disabled={!hasPermission('cost_centers', 'create')}>
              {t({ id: 'add' })}
            </ButtonPrimary>
          </Box>
        )}
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={3} isHeightRestricted>
        <TableCostCenters data={costCenters} onCostCenterDialogOpen={handleCostCenterDialogOpen} onCostCenterEdit={handleCostCenterEdit} isFetching={isFetching} />
      </LayoutAuth.Main>
      <DialogCostCenter
        costCenter={costCenter}
        costCenters={costCenters}
        onCancel={handleCostCenterDialogClose}
        onConfirm={handleCostCenterDialogConfirm}
        open={isCostCenterDialogOpen}
      />
      <Snackbar open={snackbar.isSnackbarVisible} onClose={snackbar.handleClose} message={snackbar.snackbar.message} />
    </>
  )
}
