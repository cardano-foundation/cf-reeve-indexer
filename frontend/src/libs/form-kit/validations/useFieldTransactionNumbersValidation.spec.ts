import { renderHook } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { useFieldTransactionNumbersValidation } from 'libs/form-kit/validations/useFieldTransactionNumbersValidation.ts'

const REGULAR_NUMBER_MOCK = 'VENDBILL150'
const HYPHEN_NUMBER_MOCK = 'VENDBILLCF-131'
const SLASH_NUMBER_MOCK = 'JOURNAL/162'

vi.mock('libs/translations/hooks/useTranslations.ts', () => ({
  useTranslations: () => ({
    t: vi.fn().mockReturnValue('Error')
  })
}))

describe('useFieldTransactionNumbersValidation', () => {
  it('validates single number', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(REGULAR_NUMBER_MOCK)).resolves.toBeTruthy()
  })

  it('validates multiple numbers separated by comma', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(`${REGULAR_NUMBER_MOCK},${REGULAR_NUMBER_MOCK}`)).resolves.toBeTruthy()
  })

  it('validates multiple numbers separated by space', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(`${REGULAR_NUMBER_MOCK} ${REGULAR_NUMBER_MOCK}`)).resolves.toBeTruthy()
  })

  it('validates multiple numbers separated by a mix of a space and a comma', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(`${REGULAR_NUMBER_MOCK} ${REGULAR_NUMBER_MOCK},${REGULAR_NUMBER_MOCK}`)).resolves.toBeTruthy()
  })

  it('validates numbers with hyphen', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(HYPHEN_NUMBER_MOCK)).resolves.toBeTruthy()
  })

  it('validates numbers with slash', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(SLASH_NUMBER_MOCK)).resolves.toBeTruthy()
  })

  it('validates numbers with hyphen and slash', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(`${HYPHEN_NUMBER_MOCK},${SLASH_NUMBER_MOCK}`)).resolves.toBeTruthy()
  })

  it('invalidates numbers with special characters', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(`${REGULAR_NUMBER_MOCK}$`)).rejects.toThrowError()
  })

  it('invalidates numbers not separated by a comma or a space', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(`${REGULAR_NUMBER_MOCK}.${REGULAR_NUMBER_MOCK}`)).rejects.toThrowError()
  })

  it('invalidates numbers with a space or a comma in the beginning', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(`,${REGULAR_NUMBER_MOCK}`)).rejects.toThrowError()
    await expect(result.current.validate(` ${REGULAR_NUMBER_MOCK}`)).rejects.toThrowError()
  })

  it('invalidates numbers with a space or a comma in the end', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(`${REGULAR_NUMBER_MOCK},`)).rejects.toThrowError()
    await expect(result.current.validate(`${REGULAR_NUMBER_MOCK} `)).rejects.toThrowError()
  })

  it('invalidates numbers with a comma and a space together', async () => {
    const { result } = renderHook(() => useFieldTransactionNumbersValidation())

    await expect(result.current.validate(`${REGULAR_NUMBER_MOCK}, ${REGULAR_NUMBER_MOCK}`)).rejects.toThrowError()
  })
})
