import { useTheme } from '@mui/material'
import { Trash } from 'iconsax-react'
import { ReactNode } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { CardStyled, CardContentStyled, CardHeaderStyled, IconButtonStyled } from 'modules/dashboard-tool/components/CardAnalytics/CardAnalytics.styles.tsx'

interface CardAnalyticsProps {
  children: ReactNode
  size?: 'small' | 'medium' | 'large'
  title: string
  isReadOnly?: boolean
  onClear: () => void
}

export const CardAnalytics = ({ children, size, title, isReadOnly = false, onClear }: CardAnalyticsProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <CardStyled $size={size}>
      <CardHeaderStyled
        action={
          !isReadOnly ? (
            <Tooltip title={t({ id: 'clearData' })} arrow={false} PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, -8] } }] }}>
              <IconButtonStyled onClick={onClear}>
                <Trash size={20} variant="Outline" />
              </IconButtonStyled>
            </Tooltip>
          ) : null
        }
        title={title}
        titleTypographyProps={{ color: theme.palette.text.secondary, variant: 'body1' }}
      />
      <CardContentStyled>{children}</CardContentStyled>
    </CardStyled>
  )
}
