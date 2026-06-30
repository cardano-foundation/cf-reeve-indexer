import { useContext } from 'react'

import { PublicEventsContext } from 'modules/public-events/components/PublicEventsContext/PublicEventsContext.component'

export const usePublicEventsContext = () => {
  const context = useContext(PublicEventsContext)

  if (!context) {
    throw new Error('usePublicEventsContext must be used within a PublicEventsContextProvider')
  }

  return context
}
