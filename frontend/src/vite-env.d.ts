/// <reference types="vite/client" />

import { theme } from 'libs/ui-kit/theme/theme.ts'

declare module 'styled-components' {
  type ThemeType = typeof theme

  export interface DefaultTheme extends ThemeType {}
}
