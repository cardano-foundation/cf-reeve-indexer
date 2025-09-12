import { InputAdornment, OutlinedInput, OutlinedInputProps, useTheme } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import { Eye, EyeSlash } from 'iconsax-react'
import { MouseEvent, useState } from 'react'

export type InputPasswordProps = OutlinedInputProps & {
  dataTestId?: string
  helperText?: string
}

export const InputPassword = ({ dataTestId, label, helperText, value, ...props }: InputPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false)

  const theme = useTheme()

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleMouseUpPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  return (
    <FormControl variant="outlined" fullWidth size={props.size} error={Boolean(helperText)}>
      <InputLabel htmlFor="outlined-adornment-password">{label}</InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? 'text' : 'password'}
        sx={{
          background: theme.palette.common.white,
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
        }}
        fullWidth
        label={label}
        {...props}
        endAdornment={
          value ? (
            <InputAdornment id="toggle-password-visibility" position="end">
              <IconButton
                aria-label={showPassword ? 'hide the password' : 'display the password'}
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                onMouseUp={handleMouseUpPassword}
                edge="end"
              >
                {showPassword ? <EyeSlash variant="Bold" /> : <Eye variant="Bold" />}
              </IconButton>
            </InputAdornment>
          ) : null
        }
      />
      {helperText && <FormHelperText sx={{ color: theme.palette.error.main }}>{helperText}</FormHelperText>}
    </FormControl>
  )
}
