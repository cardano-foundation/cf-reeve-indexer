import { useBlocker } from 'react-router-dom'

export const useNavigationBlocker = (isBlocked: boolean = false) => {
  const blocker = useBlocker(isBlocked)

  const handleBlockerReset = () => {
    blocker.reset?.()
  }

  const handleBlockerProceed = () => {
    blocker.proceed?.()
  }

  return {
    blocker,
    handleBlockerProceed,
    handleBlockerReset
  }
}
