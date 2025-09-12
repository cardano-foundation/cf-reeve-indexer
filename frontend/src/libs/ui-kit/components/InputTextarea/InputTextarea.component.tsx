import { useTheme } from '@mui/material'
import TextField, { TextFieldProps } from '@mui/material/TextField'

export type InputTextareaProps = TextFieldProps & {
  dataTestId?: string
}

export const InputTextarea = ({ dataTestId, label, ...rest }: InputTextareaProps) => {
  const theme = useTheme()

  return (
    <TextField
      slotProps={{
        htmlInput: {
          'data-testid': dataTestId
        },
        input: {
          notched: undefined
        }
      }}
      sx={{
        '.MuiInputBase-root': {
          background: theme.palette.common.white,
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
        }
      }}
      label={label}
      fullWidth
      multiline
      rows={2}
      variant="outlined"
      {...rest}
    />
  )
}
