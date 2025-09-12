import { PaletteOptions } from '@mui/material/styles'

import { colors as paletteColors, opacityColors } from 'libs/ui-kit/theme/colors'

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary']
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary']
  }
}

export const reeveLightPalette: PaletteOptions = {
  mode: 'light',
  common: {
    black: paletteColors.neutral[900],
    white: paletteColors.white
  },
  primary: {
    light: paletteColors.neutral[300],
    main: paletteColors.neutral[900],
    dark: paletteColors.neutral[700],
    contrastText: paletteColors.neutral[50]
  },
  secondary: {
    light: paletteColors.purple[200],
    main: paletteColors.purple[500],
    dark: paletteColors.purple[800],
    contrastText: paletteColors.neutral[50]
  },
  tertiary: {
    light: paletteColors.yellow[200],
    main: paletteColors.yellow[500],
    dark: paletteColors.yellow[800],
    contrastText: paletteColors.yellow[50]
  },
  error: {
    light: paletteColors.red[200],
    main: paletteColors.red[500],
    dark: paletteColors.red[800],
    contrastText: paletteColors.neutral[50]
  },
  warning: {
    light: paletteColors.orange[200],
    main: paletteColors.orange[500],
    dark: paletteColors.orange[800],
    contrastText: paletteColors.neutral[50]
  },
  info: {
    light: paletteColors.blue[200],
    main: paletteColors.blue[500],
    dark: paletteColors.blue[800],
    contrastText: paletteColors.neutral[50]
  },
  success: {
    light: paletteColors.green[200],
    main: paletteColors.green[500],
    dark: paletteColors.green[800],
    contrastText: paletteColors.neutral[50]
  },
  text: {
    primary: paletteColors.neutral[900],
    secondary: paletteColors.neutral[700],
    disabled: paletteColors.neutral[500]
  },
  background: {
    default: paletteColors.white,
    paper: paletteColors.neutral[50]
  },
  action: {
    disabled: paletteColors.neutral[300],
    disabledBackground: opacityColors.overlay[4],
    active: paletteColors.neutral[700]
  },
  divider: paletteColors.neutral[200]
}

export const reeveDarkPalette: PaletteOptions = {
  mode: 'dark',
  common: {
    black: paletteColors.white,
    white: paletteColors.neutral[900]
  },
  primary: {
    light: paletteColors.neutral[400],
    main: paletteColors.neutral[50],
    dark: paletteColors.neutral[200],
    contrastText: paletteColors.neutral[900]
  },
  secondary: {
    light: paletteColors.purple[800],
    main: paletteColors.purple[500],
    dark: paletteColors.purple[200],
    contrastText: paletteColors.neutral[900]
  },
  tertiary: {
    light: paletteColors.yellow[800],
    main: paletteColors.yellow[500],
    dark: paletteColors.yellow[200],
    contrastText: paletteColors.neutral[900]
  },
  error: {
    light: paletteColors.red[800],
    main: paletteColors.red[500],
    dark: paletteColors.red[200],
    contrastText: paletteColors.neutral[900]
  },
  warning: {
    light: paletteColors.orange[800],
    main: paletteColors.orange[500],
    dark: paletteColors.orange[200],
    contrastText: paletteColors.neutral[900]
  },
  info: {
    light: paletteColors.blue[800],
    main: paletteColors.blue[500],
    dark: paletteColors.blue[200],
    contrastText: paletteColors.neutral[900]
  },
  success: {
    light: paletteColors.green[800],
    main: paletteColors.green[500],
    dark: paletteColors.green[200],
    contrastText: paletteColors.neutral[900]
  },
  text: {
    primary: paletteColors.neutral[50],
    secondary: paletteColors.neutral[300],
    disabled: paletteColors.neutral[500]
  },
  background: {
    default: paletteColors.neutral[800],
    paper: paletteColors.neutral[900]
  },
  action: {
    disabled: paletteColors.neutral[700],
    disabledBackground: opacityColors.overlay[4], //we'll most likely need to create a new token for that one
    active: paletteColors.neutral[300]
  },
  divider: paletteColors.neutral[700]
}
