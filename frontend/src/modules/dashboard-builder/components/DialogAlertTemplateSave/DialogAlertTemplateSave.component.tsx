import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DialogAlert } from 'libs/ui-kit/components/DialogAlert/DialogAlert.component.tsx'

interface DialogAlertTemplateSaveProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const DialogAlertTemplateSave = ({ isOpen, onCancel, onConfirm }: DialogAlertTemplateSaveProps) => {
  const { t } = useTranslations()

  return (
    <DialogAlert
      aria-label={t({ id: 'dialogAlertDashboardBuilderTemplateSaveTitle' })}
      cancelLabel={t({ id: 'cancel' })}
      confirmLabel={t({ id: 'confirm' })}
      message={t({ id: 'dialogAlertDashboardBuilderTemplateSaveMessage' })}
      open={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
