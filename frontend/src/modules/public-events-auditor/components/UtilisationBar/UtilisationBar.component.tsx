import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { colors } from 'libs/ui-kit/theme/colors.ts'

interface UtilisationBarProps {
  allocated: number
  spent: number
}

export const UtilisationBar = ({ allocated, spent }: UtilisationBarProps) => {
  const { t } = useTranslations()
  const theme = useTheme()
  const hasNoAllocation = allocated === 0 && spent > 0
  const isOverRefunded = allocated < 0
  const ratio = allocated > 0 ? spent / allocated : spent > 0 ? 1 : 0
  const overspent = spent > allocated
  const barColor = overspent ? colors.red[500] : ratio >= 1 ? colors.green[600] : colors.blue[600]

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" gap={0.5} height="100%" width="100%" pt={1}>
      <LinearProgress
        value={Math.min(ratio, 1) * 100}
        variant="determinate"
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: theme.palette.action.hover,
          '& .MuiLinearProgress-bar': { backgroundColor: barColor }
        }}
      />
      <Typography color={overspent ? colors.red[500] : theme.palette.text.secondary} variant="caption">
        {hasNoAllocation ? t({ id: 'auditNoFundingYet' }) : isOverRefunded ? t({ id: 'auditSpendingExceedsFunding' }) : `${Math.round(ratio * 100)}%`}
      </Typography>
    </Box>
  )
}