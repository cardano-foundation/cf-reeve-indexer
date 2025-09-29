import { renderHook } from '@testing-library/react'

import { TranslationsProvider } from '../components/TranslationsProvider/TranslationsProvider.component'
import en from '../en-US.json'

import { useTranslations } from './useTranslations'

describe('UseTranslations', () => {
  it('Should translate string keys', () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: TranslationsProvider
    })

    expect(result.current.t({ id: 'organization' })).toBe(en.organization)
  })
})
