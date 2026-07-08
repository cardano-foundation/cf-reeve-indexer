import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { ExportSquare } from 'iconsax-react'
import { ReactNode } from 'react'

import { EventView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'

interface EventDetailProps {
  event: EventView
}

const DetailField = ({ label, children }: { label: string; children: ReactNode }) => {
  const theme = useTheme()

  return (
    <Box display="flex" flexDirection="column" gap={0.5} overflow="hidden">
      <Typography color={theme.palette.text.secondary} component="span" variant="caption">
        {label}
      </Typography>
      <Typography color={theme.palette.text.primary} component="span" variant="body2" sx={{ wordBreak: 'break-word' }}>
        {children ?? '—'}
      </Typography>
    </Box>
  )
}

const formatAmount = (value: number | null | undefined) => (value === null || value === undefined ? '—' : formatNumber(value))

const formatDate = (value: string | null | undefined) => (value ? dayjs(value, 'YYYY-MM-DD').format('DD/MM/YYYY') : '—')

const formatCustomValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—'

  if (typeof value === 'object') return JSON.stringify(value, null, 2)

  return String(value)
}

export const EventDetail = ({ event }: EventDetailProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const hasCustomData = Boolean(event.customData && Object.keys(event.customData).length > 0)

  const hasSpendingDetails = Boolean(
    typeof event.amountRcy === 'number' ||
      typeof event.amountFcy === 'number' ||
      event.vendor ||
      event.spendingCategory ||
      event.fxRate ||
      event.hash ||
      event.notes ||
      event.currencyCustCode
  )

  return (
    <Box display="flex" flexDirection="column" gap={4} width="100%">
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h3">{t({ id: 'eventDetails' })}</Typography>
        <Grid container columnSpacing={3} rowSpacing={2}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <DetailField label={t({ id: 'eventId' })}>{event.eventId}</DetailField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <DetailField label={t({ id: 'eventType' })}>{event.eventType}</DetailField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <DetailField label={t({ id: 'eventCategory' })}>{event.eventCategory}</DetailField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <DetailField label={t({ id: 'eventDate' })}>{formatDate(event.date)}</DetailField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <DetailField label={t({ id: 'totalAmount' })}>{formatAmount(event.totalAmount)}</DetailField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <DetailField label={t({ id: 'fundingId' })}>{event.fundingId}</DetailField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <DetailField label={t({ id: 'fundingEntity' })}>{event.fundingEntity}</DetailField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <DetailField label={t({ id: 'version' })}>{event.version}</DetailField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <DetailField label={t({ id: 'ipfsCid' })}>{event.ipfsCid}</DetailField>
          </Grid>
          <Grid size={12}>
            <DetailField label={t({ id: 'blockchainHash' })}>
              <Box alignItems="center" display="flex" gap={1}>
                <Typography component="span" variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {event.txHash}
                </Typography>
                <Tooltip title={t({ id: 'openInExplorer' })}>
                  <Link display="flex" href={`https://explorer.cardano.org/transaction/${event.txHash}`} rel="noreferrer" target="_blank">
                    <ExportSquare color={theme.palette.action.active} size={20} variant="Outline" />
                  </Link>
                </Tooltip>
              </Box>
            </DetailField>
          </Grid>
        </Grid>
      </Box>

      <Divider flexItem orientation="horizontal" />

      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h3">{t({ id: 'allocations' })}</Typography>
        {event.allocations.length ? (
          event.allocations.map((allocation, allocationIndex) => (
            <Box
              key={`${allocation.projectId}-${allocationIndex}`}
              border={`1px solid ${theme.palette.divider}`}
              borderRadius={1}
              display="flex"
              flexDirection="column"
              gap={1.5}
              p={2}>
              <Box display="flex" flexDirection="column" gap={0.5}>
                <Typography color={theme.palette.text.primary} variant="body1">
                  {allocation.projectTitle || allocation.projectId}
                </Typography>
                {allocation.subProjectTitle && (
                  <Typography color={theme.palette.text.secondary} variant="body2">
                    {allocation.subProjectTitle}
                  </Typography>
                )}
              </Box>
              {allocation.milestones.length > 0 && (
                <Box display="flex" flexDirection="column" gap={1}>
                  {allocation.milestones.map((milestone, milestoneIndex) => (
                    <Box key={`${milestone.milestoneId}-${milestoneIndex}`} alignItems="center" display="flex" gap={2} justifyContent="space-between">
                      <Typography color={theme.palette.text.secondary} variant="body2">
                        {milestone.milestoneTitle || milestone.milestoneId}
                      </Typography>
                      <Typography color={theme.palette.text.primary} variant="body2">
                        {formatAmount(milestone.allocatedAmount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))
        ) : (
          <Typography color={theme.palette.text.secondary} variant="body2">
            {t({ id: 'nothingHereMessage' })}
          </Typography>
        )}
      </Box>

      {hasSpendingDetails && (
        <>
          <Divider flexItem orientation="horizontal" />

          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h3">{t({ id: 'spendingDetails' })}</Typography>
            <Box border={`1px solid ${theme.palette.divider}`} borderRadius={1} p={2}>
              <Grid container columnSpacing={3} rowSpacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <DetailField label={t({ id: 'amountRcy' })}>{formatAmount(event.amountRcy)}</DetailField>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <DetailField label={t({ id: 'amountFcy' })}>{formatAmount(event.amountFcy)}</DetailField>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <DetailField label={t({ id: 'currency' })}>{event.currencyCustCode}</DetailField>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <DetailField label={t({ id: 'exchangeRate' })}>{event.fxRate}</DetailField>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <DetailField label={t({ id: 'vendor' })}>{event.vendor}</DetailField>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <DetailField label={t({ id: 'spendingCategory' })}>{event.spendingCategory}</DetailField>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <DetailField label={t({ id: 'documentHash' })}>{event.hash}</DetailField>
                </Grid>
                {event.notes && (
                  <Grid size={12}>
                    <DetailField label={t({ id: 'notes' })}>{event.notes}</DetailField>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        </>
      )}

      {hasCustomData && (
        <>
          <Divider flexItem orientation="horizontal" />
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h3">{t({ id: 'customData' })}</Typography>
            <Grid container columnSpacing={3} rowSpacing={2}>
              {Object.entries(event.customData ?? {}).map(([key, value]) => (
                <Grid key={key} size={{ xs: 12, sm: 6 }}>
                  <DetailField label={key}>
                    <Typography component="pre" variant="body2" sx={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>
                      {formatCustomValue(value)}
                    </Typography>
                  </DetailField>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}
    </Box>
  )
}
