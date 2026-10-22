import { useTheme } from '@mui/material'
import Box, { BoxProps } from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

interface DashboardCardProps extends Omit<BoxProps, 'title'> {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
}

export const DashboardCard = ({ title, description, icon, action, children, ...props }: DashboardCardProps) => {
  const theme = useTheme()

  return (
    <Box
      component="section"
      display="flex"
      flexDirection="column"
      gap={3}
      p={{ xs: 2, sm: 3 }}
      height="100%"
      bgcolor={theme.palette.background.default}
      border={`1px solid ${theme.palette.divider}`}
      borderRadius={4}
      {...props}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
          {icon && (
            <Box display="flex" alignItems="center" justifyContent="center" flexShrink={0} width={36} height={36} borderRadius={2} bgcolor={theme.palette.background.paper}>
              {icon}
            </Box>
          )}
          <Box minWidth={0}>
            <Typography color="text.primary" variant="h3">
              {title}
            </Typography>
            {description && (
              <Typography color="text.secondary" variant="body2">
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  )
}
