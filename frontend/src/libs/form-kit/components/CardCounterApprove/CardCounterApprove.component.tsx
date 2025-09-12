import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { Clock } from 'iconsax-react'

import { CardCounter } from 'libs/form-kit/components/CardCounter/CardCounter.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface IconApproveProps {
  hasBackground?: boolean
  hasBoldIcon?: boolean
  isDisabled: boolean
}

export const IconApprove = ({ hasBackground = false, hasBoldIcon = false, isDisabled }: IconApproveProps) => {
  const theme = useTheme()

  return (
    <Box display="flex" p={0.5} borderRadius={1.5} bgcolor={isDisabled ? (hasBackground ? theme.palette.action.disabledBackground : 'transparent') : theme.palette.tertiary?.main}>
      <Clock color={isDisabled ? theme.palette.action.disabled : theme.palette.primary?.main} variant={hasBoldIcon ? 'Bold' : !isDisabled ? 'Bold' : 'Outline'} />
    </Box>
  )
}

interface CardCounterApproveProps {
  count: number
  onClick?: () => void
}

export const CardCounterApprove = ({ count, onClick }: CardCounterApproveProps) => {
  const { t } = useTranslations()

  const isDisabled = count === 0

  return <CardCounter icon={<IconApprove isDisabled={isDisabled} hasBackground hasBoldIcon />} text={t({ id: 'readyToApprove' })} count={count} onClick={onClick} />
}
