import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DialogAlert } from 'libs/ui-kit/components/DialogAlert/DialogAlert.component.tsx'

interface DialogAlertReportNewSaveProps {
  onCancel: () => void
  onConfirm: () => void
  isOpen: boolean
  isValid?: boolean
}

export const DialogAlertReportNewSave = ({ onCancel, onConfirm, isOpen, isValid }: DialogAlertReportNewSaveProps) => {
  const { t } = useTranslations()

  return (
    <DialogAlert
      aria-label={t({ id: 'dialogAlertNewdReportTitle' })}
      alert={
        isValid !== undefined
          ? {
              children: t({ id: isValid ? 'validationSuccessAlertMessage' : 'reportDataMismatchWarningMessage' }),
              severity: isValid ? 'success' : 'warning'
            }
          : undefined
      }
      cancelLabel={t({ id: isValid === false ? 'resolveDiscrepencies' : 'cancel' })}
      confirmLabel={t({ id: 'confirm' })}
      message={t({ id: 'dialogAlertNewdReportMessage' })}
      open={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
