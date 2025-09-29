import { useLocation } from 'react-router-dom'

interface LocationState {}

export const useLocationState = <T extends LocationState | null = null>() => {
  const { pathname, search, state } = useLocation()

  return { pathname, search, state: state as T }
}
