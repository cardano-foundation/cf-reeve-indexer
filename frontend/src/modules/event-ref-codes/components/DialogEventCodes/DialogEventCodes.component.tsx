import { useTheme } from '@mui/material'
import { DialogProps as DialogPropsMUI } from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import { FormikHelpers } from 'formik'

import { EventCodeResponse, GetEventCodesResponse200 } from 'libs/api-connectors/backend-connector-lob/api/event-codes/eventCodesApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogActions } from 'libs/ui-kit/components/DialogActions/DialogActions.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'
import { EventCodeDetailsForm } from 'modules/event-ref-codes/components/EventCodeDetailsForm/EventCodeDetailsForm.component.tsx'
import { EventCodeFormValues } from 'modules/event-ref-codes/components/EventCodeDetailsForm/EventCodeDetailsForm.types.ts'
import { useDialogEventCodes } from 'modules/event-ref-codes/hooks/useDialogEventCodes'

interface DialogEventCodesProps extends DialogPropsMUI {
  eventCode?: EventCodeResponse
  eventCodes: GetEventCodesResponse200
  onCancel: () => void
  onConfirm: (values: EventCodeFormValues, formikHelpers: FormikHelpers<EventCodeFormValues>, isEditMode: boolean) => Promise<void>
}

export const DialogEventCodes = ({ eventCode, eventCodes, onCancel, onConfirm, open, ...props }: DialogEventCodesProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { initialValues, handleFormSubmit, isEditMode, isFetching, refCodeOptions } = useDialogEventCodes({ eventCode }, { onCancel, onConfirm })

  return (
    <Dialog
      aria-describedby="dialog-event-codes-description"
      aria-labelledby="dialog-event-codes-title"
      maxWidth="sm"
      onClose={onCancel}
      open={open}
      disableScrollLock
      fullWidth
      {...props}
    >
      <DialogTitle component="h2" id="dialog-event-codes-title" variant="body2" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        {t({ id: isEditMode ? 'editEventCode' : 'addEventCode' })}
      </DialogTitle>
      <DialogContent
        sx={{
          '&&': {
            minWidth: 'initial',
            pt: 2.5
          }
        }}
      >
        <EventCodeDetailsForm
          eventCodes={eventCodes}
          initialValues={initialValues}
          refCodeOptions={refCodeOptions}
          onSubmit={handleFormSubmit}
          isEditMode={isEditMode}
          isFetching={isFetching}
        />
      </DialogContent>
      <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
        <ButtonText onClick={onCancel}>{t({ id: 'cancel' })}</ButtonText>
        <ButtonPrimary form="event-codes-form" type="submit">
          {t({ id: 'save' })}
        </ButtonPrimary>
      </DialogActions>
    </Dialog>
  )
}
