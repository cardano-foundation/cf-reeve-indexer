import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { Modal } from 'features/common'
import { useGetEventsByTxModel } from 'libs/models/events-model/GetEventsByTx/GetEventsByTxModel.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { EventDetail } from 'modules/public-events/components/EventDetail/EventDetail.component'

export interface SelectedEvent {
  txHash: string
  eventId: string
}

interface AuditEventDetailModalProps {
  selected: SelectedEvent | null
  onClose: () => void
}

export const AuditEventDetailModal = ({ selected, onClose }: AuditEventDetailModalProps) => {
  const { t } = useTranslations()

  const { eventsByTx, isEventsByTxFetching } = useGetEventsByTxModel(
    { parameters: { txHash: selected?.txHash ?? '' } },
    [selected?.txHash],
    Boolean(selected?.txHash)
  )

  const event = selected ? (eventsByTx?.events ?? []).find((candidate) => candidate.eventId === selected.eventId) : undefined

  return (
    <Modal isOpen={Boolean(selected)} maxWidth="md" onClose={onClose}>
      <Modal.Header hasCloseButton>{t({ id: 'eventDetailsTitle' })}</Modal.Header>
      <Modal.Content>
        {isEventsByTxFetching ? (
          <Box alignItems="center" display="flex" justifyContent="center" minHeight="12rem">
            <LoaderCentered size={36} />
          </Box>
        ) : event ? (
          <EventDetail event={event} />
        ) : (
          <Typography variant="body2">{t({ id: 'auditEventNotFound' })}</Typography>
        )}
      </Modal.Content>
    </Modal>
  )
}
