import { useTheme } from '@mui/material'
import { DialogProps as DialogPropsMUI } from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import { FormikHelpers } from 'formik'

import { ChartOfAccount, GetChartOfAccountResponse200 } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogActions } from 'libs/ui-kit/components/DialogActions/DialogActions.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'
import { ChartOfAccountForm } from 'modules/chart-of-accounts/components/ChartOfAccountForm/ChartOfAccountForm.component.tsx'
import { ChartOfAccountFormValues } from 'modules/chart-of-accounts/components/ChartOfAccountForm/ChartOfAccountForm.types.ts'
import { useDialogChartOfAccount } from 'modules/chart-of-accounts/hooks/useDialogChartOfAccount.ts'

interface DialogChartOfAccountProps extends DialogPropsMUI {
  chartOfAccount?: ChartOfAccount
  chartOfAccounts: GetChartOfAccountResponse200
  onCancel: () => void
  onConfirm: (values: ChartOfAccountFormValues, formikHelpers: FormikHelpers<ChartOfAccountFormValues>, isEditMode: boolean) => Promise<void>
}

export const DialogChartOfAccount = ({ chartOfAccount, chartOfAccounts, onCancel, onConfirm, open, ...props }: DialogChartOfAccountProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { initialValues, organisation, handleFormSubmit, isEditMode, isFetching } = useDialogChartOfAccount({ chartOfAccount }, { onCancel, onConfirm })

  return (
    <Dialog
      aria-describedby="dialog-chart-of-account-description"
      aria-labelledby="dialog-chart-of-account-title"
      maxWidth="sm"
      open={open}
      disableScrollLock
      fullWidth
      onClose={onCancel}
      sx={{ '&& .MuiPaper-root': { height: '100%' } }}
      {...props}
    >
      <DialogTitle component="h2" id="dialog-chart-of-account-title" variant="body2" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        {t({ id: isEditMode ? 'editAccount' : 'addAccount' })}
      </DialogTitle>
      <DialogContent
        sx={{
          '&&': {
            minWidth: 'initial',
            pt: 2.5
          }
        }}
      >
        <ChartOfAccountForm
          initialValues={initialValues}
          chartOfAccounts={chartOfAccounts}
          organisation={organisation}
          onSubmit={handleFormSubmit}
          isFetching={isFetching}
          isEditMode={isEditMode}
        />
      </DialogContent>
      <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
        <ButtonText onClick={onCancel}>{t({ id: 'cancel' })}</ButtonText>
        <ButtonPrimary form="chart-of-account-form" type="submit">
          {t({ id: 'save' })}
        </ButtonPrimary>
      </DialogActions>
    </Dialog>
  )
}
