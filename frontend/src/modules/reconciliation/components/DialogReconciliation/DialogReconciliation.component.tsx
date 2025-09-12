import { DialogProps as DialogPropsMUI } from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogActions } from 'libs/ui-kit/components/DialogActions/DialogActions.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'
import { ReconciliationForm } from 'modules/reconciliation/components/ReconciliationForm/ReconciliationForm.form.tsx'
import { ReconciliationFormValues } from 'modules/reconciliation/components/ReconciliationForm/ReconciliationForm.types.ts'
import { useDialogReconciliation } from 'modules/reconciliation/hooks/useDialogReconciliation.ts'

interface DialogReconciliationProps extends DialogPropsMUI {
  onCancel: () => void
  onConfirm: (values: ReconciliationFormValues) => Promise<void>
}

export const DialogReconciliation = ({ onCancel, onConfirm, open, ...props }: DialogReconciliationProps) => {
  const { t } = useTranslations()

  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, initialValues, organisations, validationSchema, handleFormSubmit, isFetching } = useDialogReconciliation({
    onCancel,
    onConfirm
  })

  return (
    <Dialog aria-describedby="dialog-reconciliation-description" aria-labelledby="dialog-reconciliation-title" maxWidth="sm" open={open} disableScrollLock fullWidth {...props}>
      <DialogContent
        sx={{
          '&&': {
            minWidth: 'initial',
            pt: 2.5
          }
        }}
      >
        <Alert severity="warning">{t({ id: 'modalActionReconcileWarning' })}</Alert>
        <Typography variant="body2" my={4}>
          {t({ id: 'modalActionReconcileMessage' })}
        </Typography>
        <ReconciliationForm
          dateFromMaxDate={dateFromMaxDate}
          dateFromMinDate={dateFromMinDate}
          dateToMaxDate={dateToMaxDate}
          dateToMinDate={dateToMinDate}
          initialValues={initialValues}
          organisations={organisations}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          isFetching={isFetching}
        />
      </DialogContent>
      <DialogActions>
        <ButtonText onClick={onCancel}>{t({ id: 'cancel' })}</ButtonText>
        <ButtonPrimary form="reconciliation-form" type="submit">
          {t({ id: 'reconcile' })}
        </ButtonPrimary>
      </DialogActions>
    </Dialog>
  )
}
