import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Icon } from 'iconsax-react'
import { Link as RouterLink, LinkProps } from 'react-router-dom'

import { CardStyled, CardActionAreaStyled, CardContentStyled, IconWrapperStyled } from 'libs/ui-kit/components/CardPortal/CardPortal.styles.tsx'

interface CardPortalProps {
  background: string
  description: string
  icon: Icon
  title: string
  to: LinkProps['to']
}

export const CardPortal = ({ background, description, icon: Icon, title, to }: CardPortalProps) => {
  const theme = useTheme()

  return (
    <CardStyled component="article" $background={background}>
      <CardActionAreaStyled component={RouterLink} to={to} disableRipple>
        <CardContentStyled>
          <IconWrapperStyled className="icon-wrapper">
            <Icon color={theme.palette.primary.main} variant="Bold" size={32} />
          </IconWrapperStyled>
          <Box>
            <Typography component="h2" variant="h6" color={theme.palette.text.primary} fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color={theme.palette.text.primary}>
              {description}
            </Typography>
          </Box>
        </CardContentStyled>
      </CardActionAreaStyled>
    </CardStyled>
  )
}
