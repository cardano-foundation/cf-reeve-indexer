import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DialogAlert } from 'libs/ui-kit/components/DialogAlert/DialogAlert.component.tsx'

interface DialogAlertPublishedReportProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const DialogAlertPublishedReport = ({ isOpen, onCancel, onConfirm }: DialogAlertPublishedReportProps) => {
  const { t } = useTranslations()

  return (
    <DialogAlert
      aria-label={t({ id: 'dialogAlertPublishedReportTitle' })}
      cancelLabel={t({ id: 'cancel' })}
      confirmLabel={t({ id: 'createNew' })}
      message={t({ id: 'dialogAlertPublishedReportMessage' })}
      open={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
