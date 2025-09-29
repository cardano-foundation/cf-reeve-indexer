import { createBreakpoints } from '@mui/system'

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xxl: true
  }
}

export const breakpoints = createBreakpoints({ values: { xs: 0, sm: 600, md: 1200, lg: 1400, xl: 1900, xxl: 2300 } })
