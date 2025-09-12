import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { LogoContainerStyled, LogoStyled } from 'libs/layout-kit/layout-public/components/LogoSidebar/LogoSidebar.styles.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { LogoIcon } from 'libs/ui-kit/components/LogoIcon/LogoIcon.tsx'

interface LogoSidebarProps {
  isSidebarOpen: boolean
}

export const LogoSidebar = ({ isSidebarOpen }: LogoSidebarProps) => {
  const { t } = useTranslations()

  return (
    <LogoContainerStyled $isSidebarOpen={isSidebarOpen}>
      <Grid container justifyContent="center" spacing={1}>
        <Fade appear={false} in={isSidebarOpen} timeout={{ enter: 2000, exit: 0 }} unmountOnExit>
          <Grid container spacing={1}>
            <Grid size="auto">
              <Typography component="span" variant="caption" whiteSpace="nowrap">
                {t(
                  { id: 'termsOfUseLink' },
                  {
                    terms: (chunks) => (
                      <Link href="https://www.cardanofoundation.org/policy/terms-and-conditions" target="_blank" rel="noopener noreferrer" underline="always">
                        {chunks}
                      </Link>
                    )
                  }
                )}
              </Typography>
            </Grid>
            <Grid size="auto">
              <Typography component="span" variant="caption" whiteSpace="nowrap">
                {t(
                  { id: 'privacyPolicyLink' },
                  {
                    privacy: (chunks) => (
                      <Link href="https://www.cardanofoundation.org/policy/privacy" target="_blank" rel="noopener noreferrer" underline="always">
                        {chunks}
                      </Link>
                    )
                  }
                )}
              </Typography>
            </Grid>
          </Grid>
        </Fade>
        <Grid alignItems="center" container spacing={1}>
          <Fade appear={false} in={isSidebarOpen} timeout={{ enter: 2000, exit: 0 }} unmountOnExit>
            <Grid size="auto">
              <Typography component="span" variant="body2" whiteSpace="nowrap">
                {t({ id: 'poweredByLogoLabel' })}
              </Typography>
            </Grid>
          </Fade>
          <Grid width="auto">
            <LogoStyled $isSidebarOpen={isSidebarOpen}>
              <LogoIcon />
            </LogoStyled>
          </Grid>
        </Grid>
      </Grid>
    </LogoContainerStyled>
  )
}
