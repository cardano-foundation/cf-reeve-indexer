import { colors } from 'libs/ui-kit/theme/colors.ts'
import { reeveLightPalette } from 'libs/ui-kit/theme/palette.ts'
import { theme } from 'libs/ui-kit/theme/theme.ts'

export const components = {
  MuiCssBaseline: {
    styleOverrides: ({ palette }: typeof theme) => ({
      body: {
        height: '100dvh',
        backgroundColor: palette.background?.paper
      },
      '#root': {
        height: '100%',
        width: '100%'
      }
    })
  },
  MuiTableContainer: {
    styleOverrides: {
      root: {
        backgroundColor: colors.white,
        borderRadius: '8px'
      }
    }
  },
  MuiTablePagination: {
    styleOverrides: {
      selectLabel: {
        color: colors.neutral[700]
      }
    }
  },
  MuiButton: {
    styleOverrides: {
      root: {
        '--variant-outlinedBorder': reeveLightPalette.divider
      }
    }
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        backgroundColor: reeveLightPalette.common?.white
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '6.5px',
        color: reeveLightPalette.text?.secondary
      },
      label: {
        paddingLeft: '6.5px',
        paddingRight: '6.5px'
      }
    }
  }
}
