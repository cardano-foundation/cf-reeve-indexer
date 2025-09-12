import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { MessageQuestion } from 'iconsax-react'

import { ReconciliationRejectionCode } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'

export interface ReconciliationRejectionReasonsProps {
  rejectionCodes: ReconciliationRejectionCode[]
}

export const ReconciliationRejectionReasons = ({ rejectionCodes }: ReconciliationRejectionReasonsProps) => {
  const { t } = useTranslations()

  const rejectionReasons = rejectionCodes.map((rejectionCode) => t({ id: rejectionCode }))
  const [primaryReason, ...secondaryReasons] = rejectionReasons
  const secondaryReasonsAmount = secondaryReasons.length
  const tooltipLabel = `+${secondaryReasonsAmount}`

  return (
    <Box display="flex" gap={0.5}>
      <Tooltip
        placement="top-start"
        title={
          <Box p={2} maxWidth="20rem">
            <Box display="flex" pb={2}>
              <MessageQuestion variant="Bold" />
              <Typography variant="body1" color="white" pl={1.5} fontWeight="bold">
                {t({ id: 'howToSolveIt' })}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1" color="white" pb={2} textAlign="left">
                {t({ id: `${rejectionCodes[0]}_HINT_1` })}
              </Typography>
              <Typography variant="body1" color="white" textAlign="left">
                {t({ id: `${rejectionCodes[0]}_HINT_2` })}
              </Typography>
            </Box>
          </Box>
        }
      >
        <Chip label={primaryReason} />
      </Tooltip>
      {secondaryReasonsAmount > 0 ? (
        <Tooltip title={[...secondaryReasons].join(', ')}>
          <Chip label={tooltipLabel} />
        </Tooltip>
      ) : null}
    </Box>
  )
}
