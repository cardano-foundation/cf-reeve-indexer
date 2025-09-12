import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { SnackbarProps as SnackbarMUIProps } from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import { Add, Forbidden2, InfoCircle, TickCircle } from 'iconsax-react'
import { ReactNode, SyntheticEvent } from 'react'

import { SnackbarStyled } from 'libs/ui-kit/components/Snackbar/Snackbar.styles.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'
import { theme } from 'libs/ui-kit/theme/theme.ts'

export enum SnackbarType {
  SUCCESS = 'success',
  ERROR = 'error',
  LOADING = 'loading',
  INFO = 'info'
}

const assets: Record<SnackbarType, ReactNode> = {
  [SnackbarType.SUCCESS]: <TickCircle color={theme.palette.success.main} size={24} variant="Bold" />,
  [SnackbarType.ERROR]: <Forbidden2 color={theme.palette.error.main} size={24} variant="Bold" />,
  [SnackbarType.LOADING]: <CircularProgress color="inherit" size={24} />,
  [SnackbarType.INFO]: <InfoCircle color={theme.palette.info.main} size={24} variant="Bold" />
}

export interface SnackbarProps extends SnackbarMUIProps {
  hint?: string
  type?: SnackbarType
  shouldAutohide?: boolean
}

export const Snackbar = ({ open, onClose, hint, message, type = SnackbarType.SUCCESS, shouldAutohide = true, ...props }: SnackbarProps) => {
  const handleIconButtonClick = (event: SyntheticEvent) => {
    if (onClose) {
      onClose(event as unknown as Event, 'timeout')
    }
  }

  const action = (
    <>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleIconButtonClick}>
        <Box component="span" display="flex" alignItems="center" justifyContent="center" sx={{ transform: 'rotate(45deg)' }}>
          <Add variant="Outline" size={24} />
        </Box>
      </IconButton>
    </>
  )

  return (
    <SnackbarStyled
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={shouldAutohide ? 10000 : null}
      open={open}
      onClose={onClose}
      action={action}
      message={
        <Box display="flex" alignItems="center" gap={1.5}>
          {assets[type]}
          <Box component="span" display="flex" flexDirection="column" justifyContent="center" sx={{ fontSize: '1rem' }}>
            <Typography color={theme.palette.background.paper} component="span" variant="inherit">
              {message}
            </Typography>
            {hint && (
              <Typography color={paletteColors.neutral[400]} component="span" variant="body2">
                {hint}
              </Typography>
            )}
          </Box>
        </Box>
      }
      {...props}
    />
  )
}
