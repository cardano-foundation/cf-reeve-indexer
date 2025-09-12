import { useState } from 'react'

import { EventCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/event-codes/eventCodesApi.types.ts'

interface EventCodeSelectionState {
  eventCodes: EventCodeResponse[]
}

export const useEventCodesSelection = (state: EventCodeSelectionState) => {
  const { eventCodes } = state

  const [eventCodeId, setEventCodeId] = useState<string | null>(null)

  const handleEventCodeSelection = (id: string) => {
    setEventCodeId(id)
  }

  const handleEventCodeSelectionReset = () => {
    setEventCodeId(null)
  }

  const eventCode = eventCodes?.find(({ customerCode }) => customerCode === eventCodeId)

  return {
    eventCode,
    handleEventCodeSelection,
    handleEventCodeSelectionReset
  }
}
