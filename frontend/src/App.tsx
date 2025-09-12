import { CssBaseline } from '@mui/material'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { StrictMode } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'

import { TranslationsProvider } from 'libs/translations/components/TranslationsProvider/TranslationsProvider.component.tsx'
import { GlobalStyle } from 'libs/ui-kit/theme/globalStyle.styles.ts'
import { theme } from 'libs/ui-kit/theme/theme'
import { router } from 'routes'

dayjs.extend(relativeTime)

const queryClient = new QueryClient()

export const App = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <MuiThemeProvider theme={theme}>
          <StyledComponentsThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyle />
            <TranslationsProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <RouterProvider router={router} />
              </LocalizationProvider>
            </TranslationsProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </StyledComponentsThemeProvider>
        </MuiThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
