import { useTheme } from '@mui/material'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CellTextStyled } from 'libs/ui-kit/components/CellText/CellText.styles.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'

interface CellTextProps {
  value?: string | number
  isTextWrapped?: boolean
}

export const CellText = ({ value, isTextWrapped }: CellTextProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  if (!value) {
    return (
      <CellTextStyled color={paletteColors.neutral[400]} component="span" variant="body2" $isTextWrapped={isTextWrapped}>
        {t({ id: 'none' })}
      </CellTextStyled>
    )
  }

  return (
    <CellTextStyled color={theme.palette.text.primary} component="span" variant="body2" $isTextWrapped={isTextWrapped}>
      {value}
    </CellTextStyled>
  )
}
