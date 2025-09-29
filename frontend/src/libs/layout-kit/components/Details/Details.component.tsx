import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

interface DetailsProps {
  children?: ReactNode
  description?: string
  title: ReactNode
  isOrderReverted?: boolean
}

export const Details = ({ children, description, title, isOrderReverted }: DetailsProps) => {
  const theme = useTheme()

  return (
    <Box
      display="flex"
      flexDirection={isOrderReverted ? 'column-reverse' : 'column'}
      gap={{ xs: 0.5, md: 1 }}
      justifyContent="center"
      maxWidth="100%"
      overflow="hidden"
      width="100%"
    >
      {typeof title === 'string' ? (
        <Typography variant="h1" width="fit-content">
          {title}
        </Typography>
      ) : (
        title
      )}
      {description && (
        <Typography variant="body2" color={theme.palette.text.secondary}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  )
}
