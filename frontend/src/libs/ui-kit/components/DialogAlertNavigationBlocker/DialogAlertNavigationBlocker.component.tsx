import { useNavigationBlocker } from 'hooks'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DialogAlert } from 'libs/ui-kit/components/DialogAlert/DialogAlert.component.tsx'

interface DialogAlertNavigationBlockerProps {
  message: string
  isBlocked: boolean
}

export const DialogAlertNavigationBlocker = ({ message, isBlocked }: DialogAlertNavigationBlockerProps) => {
  const { t } = useTranslations()

  const { blocker, handleBlockerProceed, handleBlockerReset } = useNavigationBlocker(isBlocked)

  const isOpen = blocker.state === 'blocked'

  return (
    <DialogAlert
      aria-label={t({ id: 'dialogAlertDashoardBuilderNavigationBlockerTitle' })}
      cancelLabel={t({ id: 'cancel' })}
      confirmLabel={t({ id: 'confirm' })}
      message={message}
      open={isOpen}
      onCancel={handleBlockerReset}
      onConfirm={handleBlockerProceed}
    />
  )
}
