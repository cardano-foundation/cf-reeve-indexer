import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { TickCircle } from 'iconsax-react'

import { CardCounter } from 'libs/form-kit/components/CardCounter/CardCounter.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface IconPublishProps {
  hasBackground?: boolean
  hasBoldIcon?: boolean
  isDisabled: boolean
}

export const IconPublish = ({ hasBackground = false, hasBoldIcon = false, isDisabled }: IconPublishProps) => {
  const theme = useTheme()

  return (
    <Box display="flex" p={0.5} borderRadius={2} bgcolor={isDisabled ? (hasBackground ? theme.palette.action.disabledBackground : 'transparent') : theme.palette.success.main}>
      <TickCircle color={isDisabled ? theme.palette.action.disabled : theme.palette.primary.main} variant={hasBoldIcon ? 'Bold' : !isDisabled ? 'Bold' : 'Outline'} />
    </Box>
  )
}

interface CardCounterPublishProps {
  count: number
  onClick?: () => void
  isReview?: boolean
}

export const CardCounterPublish = ({ count, onClick, isReview = false }: CardCounterPublishProps) => {
  const { t } = useTranslations()

  const isDisabled = count === 0

  return (
    <CardCounter
      icon={<IconPublish isDisabled={isDisabled} hasBackground hasBoldIcon />}
      text={isReview ? t({ id: 'approved' }) : t({ id: 'batchPublish' })}
      count={count}
      onClick={onClick}
    />
  )
}
