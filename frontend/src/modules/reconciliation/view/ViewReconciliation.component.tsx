import { useMediaQuery, useTheme } from '@mui/material'
import Box from '@mui/material/Box'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { DialogReconciliation } from 'modules/reconciliation/components/DialogReconciliation/DialogReconciliation.component.tsx'
import { useReconciliation } from 'modules/reconciliation/hooks/useReconciliation.ts'
import { SectionDashboard } from 'modules/reconciliation/sections/SectionDashboard/SectionDashboard.component.tsx'
import { SectionResults } from 'modules/reconciliation/sections/SectionResults/SectionResults.component.tsx'

export const ViewReconciliation = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  const {
    snackbar,
    handleReconciliationDialogClose,
    handleReconciliationDialogConfirm,
    handleReconciliationDialogOpen,
    handleSnackbarClose,
    hasBeenReconciled,
    isFetching,
    isReconciliationDialogOpen,
    isSnackbarVisible
  } = useReconciliation()

  const isDesktopDown = useMediaQuery(theme.breakpoints.down('xl'))

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'reconciliationViewDescription' })} title={t({ id: 'reconciliationViewTitle' })} />
        {hasBeenReconciled && !isFetching && (
          <Box alignItems="center" display="flex" gap={1}>
            <ButtonPrimary onClick={handleReconciliationDialogOpen} disabled={!hasPermission('transactions', 'reconcilate')}>
              {t({ id: 'reconcile' })}
            </ButtonPrimary>
          </Box>
        )}
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={3} isHeightRestricted={!isDesktopDown}>
        {hasBeenReconciled && <SectionDashboard hasBeenReconciled={hasBeenReconciled} />}
        <SectionResults onReconciliationDialogOpen={handleReconciliationDialogOpen} hasBeenReconciled={hasBeenReconciled} />
      </LayoutAuth.Main>
      <DialogReconciliation onCancel={handleReconciliationDialogClose} onConfirm={handleReconciliationDialogConfirm} open={isReconciliationDialogOpen} />
      {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
      <Snackbar open={isSnackbarVisible} onClose={handleSnackbarClose} hint={snackbar.hint} message={snackbar.message} type={snackbar.type} />
    </>
  )
}
