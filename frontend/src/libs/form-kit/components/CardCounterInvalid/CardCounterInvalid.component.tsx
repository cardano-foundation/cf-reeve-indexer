import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { Forbidden2 } from 'iconsax-react'

import { CardCounter } from 'libs/form-kit/components/CardCounter/CardCounter.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface IconInvalidProps {
  hasBackground?: boolean
  hasBoldIcon?: boolean
  isDisabled: boolean
}

export const IconInvalid = ({ hasBackground = false, hasBoldIcon = false, isDisabled }: IconInvalidProps) => {
  const theme = useTheme()

  return (
    <Box display="flex" p={0.5} borderRadius={2} bgcolor={isDisabled ? (hasBackground ? theme.palette.action.disabledBackground : 'transparent') : theme.palette.error.main}>
      <Forbidden2 color={isDisabled ? theme.palette.action.disabled : theme.palette.primary.main} variant={hasBoldIcon ? 'Bold' : !isDisabled ? 'Bold' : 'Outline'} />
    </Box>
  )
}

interface CardCounterInvalidProps {
  count: number
  onClick?: () => void
}

export const CardCounterInvalid = ({ count, onClick }: CardCounterInvalidProps) => {
  const { t } = useTranslations()

  const isDisabled = count === 0

  return <CardCounter icon={<IconInvalid isDisabled={isDisabled} hasBackground hasBoldIcon />} text={t({ id: 'invalid' })} count={count} onClick={onClick} />
}
