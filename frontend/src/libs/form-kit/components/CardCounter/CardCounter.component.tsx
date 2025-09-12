import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ArrowRight2 } from 'iconsax-react'
import { ReactNode } from 'react'

import { CardStyled, CardActionAreaStyled, CardContentStyled, ContentStyled, IconContentStyled } from 'libs/form-kit/components/CardCounter/CardCounter.styles.tsx'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'

interface CardCounterProps {
  icon: ReactNode
  text: string
  count: number
  onClick?: () => void
}

export const CardCounter = ({ icon, text, count, onClick }: CardCounterProps) => {
  const theme = useTheme()

  const isDisabled = count === 0

  return (
    <CardStyled>
      <CardActionAreaStyled onClick={onClick} disabled={isDisabled} disableRipple>
        <CardContentStyled>
          <ContentStyled display="flex" alignItems="center" justifyContent="space-between" $isDisabled={isDisabled}>
            <Box display="flex" alignItems="center">
              {icon}
              <Typography
                ml={1.5}
                mr={1}
                variant="body2"
                component="span"
                color={isDisabled ? theme.palette.text.disabled : theme.palette.text.primary}
                style={{ textDecoration: 'none' }}
              >
                {text}
              </Typography>
            </Box>
            <Chip label={count} variant="filled" disabled={isDisabled} />
          </ContentStyled>
          <IconContentStyled display="flex" alignItems="center" justifyContent="center">
            <ArrowRight2 color={isDisabled ? theme.palette.action.disabled : theme.palette.action.active} size={20} variant="Outline" />
          </IconContentStyled>
        </CardContentStyled>
      </CardActionAreaStyled>
    </CardStyled>
  )
}
