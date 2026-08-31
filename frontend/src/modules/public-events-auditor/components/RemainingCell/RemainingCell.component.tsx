import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { Danger } from 'iconsax-react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TruncatedCellText } from 'libs/ui-kit/components/CellText/TruncatedCellText.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatAuditAmount } from 'modules/public-events-auditor/utils/format.ts'

interface RemainingCellProps {
  allocated: number
  spent: number
}

export const RemainingCell = ({ allocated, spent }: RemainingCellProps) => {
  const { t } = useTranslations()
  const theme = useTheme()
  const remaining = allocated - spent

  if (remaining >= 0) {
    return <TruncatedCellText value={formatAuditAmount(remaining)} />
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5} width="100%" minWidth={0}>
      <Box minWidth={0}>
        <TruncatedCellText value={formatAuditAmount(0)} />
      </Box>
      <Tooltip title={t({ id: 'auditSpendingExceedsFunding' })}>
        <Box display="flex" flexShrink={0}>
          <Danger color={theme.palette.warning.main} size={20} variant="Outline" />
        </Box>
      </Tooltip>
    </Box>
  )
}
