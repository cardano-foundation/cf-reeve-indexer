import { renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { useFieldBlockchainHashValidation } from 'libs/form-kit/validations/useFieldBlockchainHashValidation.ts'

const HASH_MOCK = '26e80e43f4ac18e1c7e724fc304ef2b24308d60fb610306bb88eff62f97784be'

vi.mock('libs/translations/hooks/useTranslations.ts', () => ({
  useTranslations: () => ({
    t: vi.fn().mockReturnValue('Error')
  })
}))

describe('useFieldBlockchainHashValidation', () => {
  it('validates single hash', async () => {
    const { result } = renderHook(() => useFieldBlockchainHashValidation())

    await expect(result.current.validate(HASH_MOCK)).resolves.toBeTruthy()
  })

  it('validates multiple hashes separated by comma', async () => {
    const { result } = renderHook(() => useFieldBlockchainHashValidation())

    await expect(result.current.validate(`${HASH_MOCK},${HASH_MOCK}`)).resolves.toBeTruthy()
  })

  it('validates multiple hashes separated by space', async () => {
    const { result } = renderHook(() => useFieldBlockchainHashValidation())

    await expect(result.current.validate(`${HASH_MOCK} ${HASH_MOCK}`)).resolves.toBeTruthy()
  })

  it('validates multiple hashes separated by a mix of a space and a comma', async () => {
    const { result } = renderHook(() => useFieldBlockchainHashValidation())

    await expect(result.current.validate(`${HASH_MOCK} ${HASH_MOCK},${HASH_MOCK}`)).resolves.toBeTruthy()
  })

  it('invalidates hashes with special characters', async () => {
    const { result } = renderHook(() => useFieldBlockchainHashValidation())

    await expect(result.current.validate(`${HASH_MOCK}$`)).rejects.toThrowError()
  })

  it('invalidates hashes with incorrect length', async () => {
    const { result } = renderHook(() => useFieldBlockchainHashValidation())

    await expect(result.current.validate(HASH_MOCK.slice(-4))).rejects.toThrowError()
  })

  it('invalidates hashes not separated by a comma or a space', async () => {
    const { result } = renderHook(() => useFieldBlockchainHashValidation())

    await expect(result.current.validate(`${HASH_MOCK}${HASH_MOCK}`)).rejects.toThrowError()
  })

  it('invalidates hashes with a space or a comma in the beginning', async () => {
    const { result } = renderHook(() => useFieldBlockchainHashValidation())

    await expect(result.current.validate(`,${HASH_MOCK}`)).rejects.toThrowError()
    await expect(result.current.validate(` ${HASH_MOCK}`)).rejects.toThrowError()
  })

  it('invalidates hashes with a space or a comma in the end', async () => {
    const { result } = renderHook(() => useFieldBlockchainHashValidation())

    await expect(result.current.validate(`${HASH_MOCK},`)).rejects.toThrowError()
    await expect(result.current.validate(`${HASH_MOCK} `)).rejects.toThrowError()
  })

  it('invalidates hashes with a comma and a space together', async () => {
    const { result } = renderHook(() => useFieldBlockchainHashValidation())

    await expect(result.current.validate(`${HASH_MOCK}, ${HASH_MOCK}`)).rejects.toThrowError()
  })
})
