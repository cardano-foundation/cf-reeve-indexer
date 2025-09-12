import { useTheme } from '@mui/material'
import { DialogProps as DialogPropsMUI } from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import { FormikHelpers } from 'formik'

import { GetVatCodesResponse200, VatCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogActions } from 'libs/ui-kit/components/DialogActions/DialogActions.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'
import { VatCodeForm } from 'modules/vat-codes/components/VatCodeForm/VatCodeForm.component.tsx'
import { VatCodeFormValues } from 'modules/vat-codes/components/VatCodeForm/VatCodeForm.types.ts'
import { useDialogVatCode } from 'modules/vat-codes/hooks/useDialogVatCode.ts'

interface DialogVatCodeProps extends DialogPropsMUI {
  vatCode?: VatCodeResponse
  vatCodes: GetVatCodesResponse200
  onCancel: () => void
  onConfirm: (values: VatCodeFormValues, formikHelpers: FormikHelpers<VatCodeFormValues>, isEditMode: boolean) => Promise<void>
}

export const DialogVatCode = ({ vatCode, vatCodes, onCancel, onConfirm, open, ...props }: DialogVatCodeProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { initialValues, handleFormSubmit, isEditMode } = useDialogVatCode({ vatCode }, { onCancel, onConfirm })

  return (
    <Dialog aria-describedby="dialog-vat-codes-description" aria-labelledby="dialog-vat-codes-title" maxWidth="sm" open={open} disableScrollLock fullWidth {...props}>
      <DialogTitle component="h2" variant="body2" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        {t({ id: isEditMode ? 'editVatCode' : 'addVatCode' })}
      </DialogTitle>
      <DialogContent
        sx={{
          '&&': {
            minWidth: 'initial',
            pt: 2.5
          }
        }}
      >
        <VatCodeForm initialValues={initialValues} vatCodes={vatCodes} onSubmit={handleFormSubmit} isEditMode={isEditMode} />
      </DialogContent>
      <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
        <ButtonText onClick={onCancel}>{t({ id: 'cancel' })}</ButtonText>
        <ButtonPrimary form="vat-code-form" type="submit">
          {t({ id: 'save' })}
        </ButtonPrimary>
      </DialogActions>
    </Dialog>
  )
}
