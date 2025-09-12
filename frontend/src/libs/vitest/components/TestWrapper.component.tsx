import { CssBaseline } from '@mui/material'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'

import { TranslationsProvider } from 'libs/translations/components/TranslationsProvider/TranslationsProvider.component.tsx'
import { GlobalStyle } from 'libs/ui-kit/theme/globalStyle.styles.ts'
import { theme } from 'libs/ui-kit/theme/theme'
import { BatchPublishContextProvider } from 'modules/publish/components/BatchPublishContext/BatchPublishContext.component.tsx'
import { TransactionsPublishContextProvider } from 'modules/publish/components/TransactionsPublishContext/TransactionsPublishContext.component.tsx'
import { BatchContextProvider } from 'modules/review/components/BatchContext/BatchContext.component.tsx'
import { TransactionsContextProvider } from 'modules/review/components/TransactionsContext/TransactionsContext.component.tsx'
import { TransactionsReprocessContextProvider } from 'modules/review/components/TransactionsReprocessContext/TransactionsReprocessContext.component'

export const TestWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider theme={theme}>
        <StyledComponentsThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyle />
          <TranslationsProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MemoryRouter>
                <BatchContextProvider>
                  <BatchPublishContextProvider>
                    <TransactionsContextProvider>
                      <TransactionsPublishContextProvider>
                        <TransactionsReprocessContextProvider>{children}</TransactionsReprocessContextProvider>
                      </TransactionsPublishContextProvider>
                    </TransactionsContextProvider>
                  </BatchPublishContextProvider>
                </BatchContextProvider>
              </MemoryRouter>
            </LocalizationProvider>
          </TranslationsProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </StyledComponentsThemeProvider>
      </MuiThemeProvider>
    </QueryClientProvider>
  )
}
