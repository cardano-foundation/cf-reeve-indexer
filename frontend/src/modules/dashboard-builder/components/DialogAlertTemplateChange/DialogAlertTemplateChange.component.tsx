import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DialogAlert } from 'libs/ui-kit/components/DialogAlert/DialogAlert.component.tsx'

interface DialogAlertTemplateChangeProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const DialogAlertTemplateChange = ({ isOpen, onCancel, onConfirm }: DialogAlertTemplateChangeProps) => {
  const { t } = useTranslations()

  return (
    <DialogAlert
      aria-label={t({ id: 'dialogAlertDashboardBuilderTemplateChangeTitle' })}
      cancelLabel={t({ id: 'cancel' })}
      confirmLabel={t({ id: 'confirm' })}
      message={t({ id: 'dialogAlertDashboardBuilderTemplateChangeMessage' })}
      open={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
