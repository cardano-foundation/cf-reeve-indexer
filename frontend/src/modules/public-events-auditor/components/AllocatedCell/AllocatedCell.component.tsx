import Box from '@mui/material/Box'
import { ArrowRotateLeft } from 'iconsax-react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TruncatedCellText } from 'libs/ui-kit/components/CellText/TruncatedCellText.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors } from 'libs/ui-kit/theme/colors.ts'
import { formatAuditAmount } from 'modules/public-events-auditor/utils/format.ts'

interface AllocatedCellProps {
  allocated: number
  refunded: number
}

export const AllocatedCell = ({ allocated, refunded }: AllocatedCellProps) => {
  const { t } = useTranslations()

  if (!(refunded > 0)) {
    return <TruncatedCellText value={formatAuditAmount(allocated)} />
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5} width="100%" minWidth={0}>
      <Box minWidth={0}>
        <TruncatedCellText value={formatAuditAmount(allocated)} />
      </Box>
      <Tooltip title={t({ id: 'auditRefundedBy' }, { amount: formatAuditAmount(refunded) })}>
        <Box display="flex" flexShrink={0}>
          <ArrowRotateLeft color={colors.blue[600]} size={20} variant="Outline" />
        </Box>
      </Tooltip>
    </Box>
  )
}
