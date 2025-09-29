import { createIntl, createIntlCache } from 'react-intl'

import en from '../en-US.json'

const cache = createIntlCache()

export const intl = createIntl(
  {
    locale: 'en-US',
    messages: en
  },
  cache
)
