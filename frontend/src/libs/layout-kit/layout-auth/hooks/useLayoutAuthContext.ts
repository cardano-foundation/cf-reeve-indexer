import { useContext } from 'react'

import { LayoutAuthContext } from 'libs/layout-kit/layout-auth/components/LayoutAuthContext/LayoutAuthContext.component.tsx'

export const useLayoutAuthContext = () => {
  const context = useContext(LayoutAuthContext)

  if (!context) {
    throw new Error('useLayoutAuthContext must be used within a LayoutAuthContextProvider')
  }

  return context
}
