import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { ShieldTick } from 'iconsax-react'

import { CardCounter } from 'libs/form-kit/components/CardCounter/CardCounter.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface IconPublishedProps {
  hasBackground?: boolean
  hasBoldIcon?: boolean
  isDisabled: boolean
}

export const IconPublished = ({ hasBackground = false, hasBoldIcon = false, isDisabled }: IconPublishedProps) => {
  const theme = useTheme()

  return (
    <Box display="flex" p={0.5} borderRadius={2} bgcolor={isDisabled ? (hasBackground ? theme.palette.action.disabledBackground : 'transparent') : theme.palette.secondary.main}>
      <ShieldTick color={isDisabled ? theme.palette.action.disabled : theme.palette.primary.main} variant={hasBoldIcon ? 'Bold' : !isDisabled ? 'Bold' : 'Outline'} />
    </Box>
  )
}

interface CardCounterPublishedProps {
  count: number
  onClick?: () => void
}

export const CardCounterPublished = ({ count, onClick }: CardCounterPublishedProps) => {
  const { t } = useTranslations()

  const isDisabled = count === 0

  return <CardCounter icon={<IconPublished isDisabled={isDisabled} hasBackground hasBoldIcon />} text={t({ id: 'batchPublished' })} count={count} onClick={onClick} />
}
