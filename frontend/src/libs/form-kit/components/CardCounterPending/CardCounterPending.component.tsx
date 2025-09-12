import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { Warning2 } from 'iconsax-react'

import { CardCounter } from 'libs/form-kit/components/CardCounter/CardCounter.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface IconPendingProps {
  hasBackground?: boolean
  hasBoldIcon?: boolean
  isDisabled: boolean
}

export const IconPending = ({ hasBackground = false, hasBoldIcon = false, isDisabled }: IconPendingProps) => {
  const theme = useTheme()

  return (
    <Box display="flex" p={0.5} borderRadius={2} bgcolor={isDisabled ? (hasBackground ? theme.palette.action.disabledBackground : 'transparent') : theme.palette.warning.main}>
      <Warning2 color={isDisabled ? theme.palette.action.disabled : theme.palette.primary.main} variant={hasBoldIcon ? 'Bold' : !isDisabled ? 'Bold' : 'Outline'} />
    </Box>
  )
}

interface CardCounterPendingProps {
  count: number
  onClick?: () => void
}

export const CardCounterPending = ({ count, onClick }: CardCounterPendingProps) => {
  const { t } = useTranslations()

  const isDisabled = count === 0

  return <CardCounter icon={<IconPending isDisabled={isDisabled} hasBackground hasBoldIcon />} text={t({ id: 'pending' })} count={count} onClick={onClick} />
}
