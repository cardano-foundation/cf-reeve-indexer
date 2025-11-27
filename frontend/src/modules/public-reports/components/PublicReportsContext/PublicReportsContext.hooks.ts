import { useContext } from 'react'

import { PublicReportsContext } from 'modules/public-reports/components/PublicReportsContext/PublicReportsContext.component'

export const usePublicReportsContext = () => {
  const context = useContext(PublicReportsContext)

  if (!context) {
    throw new Error('usePublicReportsContext must be used within a PublicReportsContextProvider')
  }

  return context
}
