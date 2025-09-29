import { useTheme } from '@mui/material'
import TextField, { TextFieldProps } from '@mui/material/TextField'

export type InputTextProps = TextFieldProps & {
  dataTestId?: string
  isReadOnly?: boolean
}

export const InputText = ({ dataTestId, isReadOnly, ...rest }: InputTextProps) => {
  const theme = useTheme()

  return (
    <TextField
      sx={{
        '&& .MuiInputLabel-root': {
          '&:has(+.Mui-error.Mui-disabled)': {
            color: theme.palette.text.disabled
          }
        },
        '&& .MuiInputBase-root': {
          background: theme.palette.common.white,
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
        }
      }}
      slotProps={{
        htmlInput: {
          'data-testid': dataTestId
        },
        input: {
          notched: undefined,
          readOnly: isReadOnly
        }
      }}
      size="small"
      variant="outlined"
      fullWidth
      {...rest}
    />
  )
}
