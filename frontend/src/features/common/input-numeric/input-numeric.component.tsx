import { useEffect, useRef } from 'react'

import { DEFAULT_VALUE_REGEX } from 'consts'

import { InputNumericStyled } from './input-numeric.styles'
import type { InputNumericProps } from './input-numeric.types'
import { validateDefault } from './input-numeric.utils'

export const InputNumeric = ({ label, name, value, valueRegex = DEFAULT_VALUE_REGEX, onChange, disabled, error, required, ...props }: InputNumericProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const input = inputRef?.current

    const validate = (event: InputEvent) => validateDefault(event, valueRegex)

    if (input) {
      input?.addEventListener('beforeinput', validate)
    }

    return () => {
      input?.removeEventListener('beforeinput', validate)
    }
  }, [])

  return <InputNumericStyled autoComplete="off" inputMode="decimal" type="text" {...{ inputRef, label, name, value, onChange, disabled, error, required, ...props }} />
}
