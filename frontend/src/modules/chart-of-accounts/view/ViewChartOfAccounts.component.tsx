import Box from '@mui/material/Box'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component'
import { DialogChartOfAccount } from 'modules/chart-of-accounts/components/DialogChartOfAccount/DialogChartOfAccount.component.tsx'
import { TableChartOfAccounts } from 'modules/chart-of-accounts/components/TableChartOfAccounts/TableChartOfAccounts.component.tsx'
import { useChartOfAccounts } from 'modules/chart-of-accounts/hooks/useChartOfAccounts.ts'

export const ViewChartOfAccounts = () => {
  const { t } = useTranslations()

  const {
    chartOfAccount,
    chartOfAccounts,
    handleChartOfAccountDialogClose,
    handleChartOfAccountDialogConfirm,
    handleChartOfAccountDialogOpen,
    handleChartOfAccountEdit,
    hasChartOfAccounts,
    isChartOfAccountDialogOpen,
    isFetching,
    snackbar
  } = useChartOfAccounts()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details title={t({ id: 'chartOfAccountsViewTitle' })} />
        {hasChartOfAccounts && !isFetching && (
          <Box alignItems="center" display="flex" gap={1}>
            <ButtonPrimary onClick={handleChartOfAccountDialogOpen} disabled={!hasPermission('chart_of_accounts', 'create')}>
              {t({ id: 'add' })}
            </ButtonPrimary>
          </Box>
        )}
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={3} isHeightRestricted>
        <TableChartOfAccounts
          data={chartOfAccounts}
          onChartOfAccountDialogOpen={handleChartOfAccountDialogOpen}
          onChartOfAccountEdit={handleChartOfAccountEdit}
          isFetching={isFetching}
        />
      </LayoutAuth.Main>
      <DialogChartOfAccount
        chartOfAccount={chartOfAccount}
        chartOfAccounts={chartOfAccounts}
        onCancel={handleChartOfAccountDialogClose}
        onConfirm={handleChartOfAccountDialogConfirm}
        open={isChartOfAccountDialogOpen}
      />
      <Snackbar
        open={snackbar.isSnackbarVisible}
        hint={snackbar.snackbar.hint}
        message={snackbar.snackbar.message}
        type={snackbar.snackbar.type}
        onClose={snackbar.handleSnackbarClose}
      />
    </>
  )
}
