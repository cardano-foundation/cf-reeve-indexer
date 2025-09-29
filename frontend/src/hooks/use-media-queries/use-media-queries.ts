import { useMediaQuery, useTheme } from '@mui/material'

export const useMediaQueries = () => {
  const theme = useTheme()

  const isDesktop = useMediaQuery(theme.breakpoints.down('xl'))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return { isDesktop, isMobile }
}
