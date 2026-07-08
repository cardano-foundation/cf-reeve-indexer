import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { SpendingLineView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { formatAuditAmount, formatAuditDate } from 'modules/public-events-auditor/utils/format.ts'

interface AuditSpendingLedgerProps {
  spending: SpendingLineView[]
  currency: string | null
}

export const AuditSpendingLedger = ({ spending, currency }: AuditSpendingLedgerProps) => {
  const { t } = useTranslations()
  const theme = useTheme()

  return (
    <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ minWidth: 100 }}>{t({ id: 'eventDate' })}</TableCell>
            <TableCell>{t({ id: 'vendor' })}</TableCell>
            <TableCell>{t({ id: 'spendingCategory' })}</TableCell>
            <TableCell>{t({ id: 'project' })}</TableCell>
            <TableCell align="right">{t({ id: 'auditAmount' })}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {spending.map((line, index) => (
            <TableRow key={line.eventId ?? `${line.txHash}-${index}`} hover>
              <TableCell>
                <Typography color={theme.palette.text.primary} variant="body2">
                  {formatAuditDate(line.date)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color={theme.palette.text.primary} variant="body2">
                  {line.vendor || '—'}
                </Typography>
              </TableCell>
              <TableCell>
                {line.spendingCategory ? (
                  <Chip label={line.spendingCategory} />
                ) : (
                  <Typography color={theme.palette.text.secondary} variant="body2">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {line.projectTitle || line.projectId ? (
                  <Typography color={theme.palette.text.primary} variant="body2">
                    {line.projectTitle || line.projectId}
                    {line.milestoneTitle && (
                      <Typography color={theme.palette.text.secondary} component="span" variant="caption" sx={{ display: 'block' }}>
                        {line.milestoneTitle}
                      </Typography>
                    )}
                  </Typography>
                ) : (
                  <Typography color={theme.palette.text.secondary} variant="body2" sx={{ fontStyle: 'italic' }}>
                    {t({ id: 'auditUnattributed' })}
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Typography color={theme.palette.text.primary} variant="body2" sx={{ fontWeight: 600 }}>
                  {formatAuditAmount(line.amount, currency)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
