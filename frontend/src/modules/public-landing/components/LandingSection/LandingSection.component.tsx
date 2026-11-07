import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactNode, useId } from 'react'

import { LandingSectionStyled } from './LandingSection.styles'

interface LandingSectionProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
}

export const LandingSection = ({ title, description, icon, children }: LandingSectionProps) => {
  const titleId = useId()

  return (
    <LandingSectionStyled component="section" aria-labelledby={titleId}>
      <Box display="flex" flexDirection="column" gap={0.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          {icon}
          <Typography id={titleId} component="h2" variant="h2">
            {title}
          </Typography>
        </Box>
        {description && (
          <Typography color="text.secondary" variant="body2">
            {description}
          </Typography>
        )}
      </Box>
      {children}
    </LandingSectionStyled>
  )
}
