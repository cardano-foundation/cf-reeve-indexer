import { useContext } from 'react'

import { LayoutPublicContext } from 'libs/layout-kit/layout-public/components/LayoutPublicContext/LayoutPublicContext.component.tsx'

export const useLayoutPublicContext = () => {
  const context = useContext(LayoutPublicContext)
  if (!context) {
    throw new Error('useLayoutPublicContext must be used within a LayoutPublicContextProvider')
  }

  return context
}
