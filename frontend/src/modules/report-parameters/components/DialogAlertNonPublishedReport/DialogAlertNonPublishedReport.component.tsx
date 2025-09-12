import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DialogAlert } from 'libs/ui-kit/components/DialogAlert/DialogAlert.component.tsx'

interface DialogAlertNonPublishedReportProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const DialogAlertNonPublishedReport = ({ isOpen, onCancel, onConfirm }: DialogAlertNonPublishedReportProps) => {
  const { t } = useTranslations()

  return (
    <DialogAlert
      aria-label={t({ id: 'dialogAlertNonPublishedReportTitle' })}
      cancelLabel={t({ id: 'cancel' })}
      confirmLabel={t({ id: 'edit' })}
      message={t({ id: 'dialogAlertNonPublishedReportMessage' })}
      open={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
