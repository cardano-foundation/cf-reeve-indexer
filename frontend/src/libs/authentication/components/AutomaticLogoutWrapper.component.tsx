import { useCallback, useEffect, useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'

import { countdown } from 'libs/authentication/components/AutomaticLogoutWrapper.utils.ts'
import { useLogOut } from 'libs/authentication/services/logOut.service.ts'
import { getSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/getSessionStorageItem.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ModalAction } from 'libs/ui-kit/components/ModalAction/ModalAction.component.tsx'

export const AutomaticLogout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalCountdownValue, setModalCountdownValue] = useState(60)
  const [stopModalCountdown, setStopModalCountdown] = useState<() => void>(() => {})

  const { t } = useTranslations()

  const logOut = useLogOut<{ logOutReason: string }>({ logOutReason: 'loggedOutInactiveUser' })

  const loggedIn = getSessionStorageItem('accessToken') !== undefined

  const handleLogOut = useCallback(() => {
    logOut()
  }, [logOut])

  useEffect(() => {
    if (modalCountdownValue === 0) {
      handleLogOut()
    }
  }, [modalCountdownValue, handleLogOut])

  const { reset } = useIdleTimer({
    disabled: !loggedIn,
    timeout: 1000 * 60 * 5,
    onIdle: () => {
      setIsModalOpen(true)
      const stopModalCountdown = countdown(60, (current) => {
        setModalCountdownValue(current)
      })
      setStopModalCountdown(() => stopModalCountdown)
    },
    debounce: 500
  })

  const handleStayLoggedIn = () => {
    reset()

    setIsModalOpen(false)

    stopModalCountdown()
  }

  return (
    <ModalAction
      aria-label={t({ id: 'automaticLogoutModalTitle' })}
      isOpen={isModalOpen}
      message={t({ id: 'automaticLogoutModalDescription' })}
      primaryActionLabel={t({ id: 'automaticLogoutModalButton' })}
      primaryActionOnClick={handleStayLoggedIn}
    />
  )
}
