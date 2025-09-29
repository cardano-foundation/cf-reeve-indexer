import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ArrowRight2, Icon } from 'iconsax-react'
import { Link as RouterLink, LinkProps } from 'react-router-dom'

import { CardStyled, IconContentStyled, ContentStyled, CardActionAreaStyled, CardContentStyled, IconWrapperStyled } from 'libs/ui-kit/components/CardSubPortal/CardSubPortal.styles'

interface CardSubPortalProps {
  background: string
  icon: Icon
  iconColor: string
  title: string
  to: LinkProps['to']
}

export const CardSubPortal = ({ background, icon: Icon, iconColor, title, to }: CardSubPortalProps) => {
  const theme = useTheme()

  return (
    <CardStyled component="article" $background={background}>
      <CardActionAreaStyled component={RouterLink} to={to} disableRipple>
        <CardContentStyled>
          <ContentStyled display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="left">
              <IconWrapperStyled className="icon-wrapper">
                <Icon color={iconColor} variant="Outline" size={40} />
              </IconWrapperStyled>
              <Typography ml={1} mr={1} variant="h6" component="h3" color={theme.palette.text.primary} style={{ textDecoration: 'none' }} fontWeight={600}>
                {title}
              </Typography>
            </Box>
            <IconContentStyled className="arrow-icon-wrapper" display="flex" alignItems="end" justifyContent="end">
              <ArrowRight2 size={20} />
            </IconContentStyled>
          </ContentStyled>
        </CardContentStyled>
      </CardActionAreaStyled>
    </CardStyled>
  )
}
