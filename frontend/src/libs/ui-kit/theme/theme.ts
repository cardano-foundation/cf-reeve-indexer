import { createTheme, Theme } from '@mui/material/styles'

import { breakpoints } from 'libs/ui-kit/theme/breakpoints.ts'
import { components } from 'libs/ui-kit/theme/components.ts'
import { reeveLightPalette } from 'libs/ui-kit/theme/palette.ts'
import { typography } from 'libs/ui-kit/theme/typography.ts'

export const theme: Theme = createTheme({
  palette: reeveLightPalette, // TODO: once we are ready with dark mode, we will do conditional palette.
  typography,
  breakpoints,
  components
})
