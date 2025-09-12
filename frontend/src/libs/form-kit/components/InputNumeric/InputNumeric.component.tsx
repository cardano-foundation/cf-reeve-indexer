import Grid from '@mui/material/Grid'
import { TextFieldProps as TextFieldPropsMUI } from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useRef } from 'react'

import { REPORT_VALUE_REGEX } from 'libs/const/regexp.ts'
import { validateDefault } from 'libs/form-kit/components/InputNumeric/InputNumeric.utils.ts'
import { Input } from 'libs/ui-kit/components/Input/Input.component.tsx'

type InputNumericProps = TextFieldPropsMUI & {
  valueRegex?: RegExp
  isRegular?: boolean
}

export const InputNumeric = ({ label, name, value, valueRegex = REPORT_VALUE_REGEX, onChange, onBlur, onFocus, isRegular, ...props }: InputNumericProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

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

  if (isRegular) {
    return (
      <Input
        autoComplete="off"
        inputRef={inputRef}
        label={label}
        name={name}
        type="text"
        value={value}
        slotProps={{
          htmlInput: {
            inputMode: 'decimal'
          }
        }}
        sx={{ '.MuiInputBase-input': { textAlign: 'right' } }}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        fullWidth
        {...props}
      />
    )
  }

  return (
    <Grid alignItems="center" container size="grow" spacing={{ xs: 1, sm: 3 }}>
      <Grid size={{ xs: 12, sm: 'grow' }}>
        <Typography component="label" htmlFor={name} variant="body1">
          {label}
        </Typography>
      </Grid>
      <Grid display="flex" justifyContent="flex-end" maxWidth={{ xs: '100%', sm: '14.5rem' }} size="grow">
        <Input
          autoComplete="off"
          inputRef={inputRef}
          name={name}
          type="text"
          value={value}
          slotProps={{
            htmlInput: {
              inputMode: 'decimal'
            }
          }}
          sx={{ '.MuiInputBase-input': { textAlign: 'right' } }}
          onBlur={onBlur}
          onChange={onChange}
          onFocus={onFocus}
          fullWidth
          {...props}
        />
      </Grid>
    </Grid>
  )
}
