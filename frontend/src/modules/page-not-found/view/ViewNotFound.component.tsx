import { useTheme, useMediaQuery } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component'
import { PATHS } from 'routes'

export const ViewNotFound = () => {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))

  return (
    <Box
      px={20}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        height: { xs: 'auto', sm: '400px' },
        paddingLeft: isTablet ? '0px' : '160px',
        paddingRight: isTablet ? '0px' : '160px'
      }}
    >
      <Box
        sx={{
          flex: '1',
          padding: '20px',
          marginRight: isTablet ? '0px' : '40px',
          marginTop: !isTablet ? '10%' : '0px',
          order: { xs: '1', sm: '1' }
        }}
      >
        <Typography
          variant="h4"
          sx={{
            display: 'flex',
            justifyContent: isTablet ? 'center' : 'start'
          }}
        >
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            display: 'flex',
            justifyContent: isTablet ? 'center' : 'start',
            marginTop: isTablet ? '60px' : '40px',
            width: isTablet ? 'auto' : '550px',
            wordBreak: 'break-word'
          }}
        >
          Sorry, but it seems the page you&apos;re searching for doesn’t exist. Please feel free to click the button below and return to the home page, or you can use the
          navigation located at the top of the page to find your way around.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: isTablet ? 'center' : 'start',
            marginTop: isTablet ? '0px' : '40px'
          }}
        >
          <ButtonText component={RouterLink} to={PATHS.ROOT}>
            Go home
          </ButtonText>
        </Box>
      </Box>

      {!isTablet ? (
        <Box
          sx={{
            flex: '1',
            padding: '20px',
            order: { xs: '2', sm: '2' }
          }}
        >
          <h1>404</h1>
        </Box>
      ) : null}
    </Box>
  )
}
