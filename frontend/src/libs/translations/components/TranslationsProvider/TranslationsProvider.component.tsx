import { ReactNode } from 'react'
import { IntlProvider } from 'react-intl'

import en from '../../en-US.json'

interface TranslationsProviderProps {
  children: ReactNode
}

export const TranslationsProvider = ({ children }: TranslationsProviderProps) => {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={en}>
      {children}
    </IntlProvider>
  )
}
