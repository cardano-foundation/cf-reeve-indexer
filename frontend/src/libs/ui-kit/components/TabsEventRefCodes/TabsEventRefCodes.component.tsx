import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tabs from '@mui/material/Tabs'
import { SyntheticEvent, useEffect } from 'react'

import { useLocationState } from 'hooks'
import { a11yProps, TabCustom } from 'libs/form-kit/components/TabCustom/TabCustom.component.tsx'
import { TabPanelCustom } from 'libs/form-kit/components/TabPanelCustom/TabPanelCustom.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { DialogEventCodes } from 'modules/event-ref-codes/components/DialogEventCodes/DialogEventCodes.component.tsx'
import { DialogRefCodes } from 'modules/event-ref-codes/components/DialogRefCodes/DialogRefCodes.component.tsx'
import { useEventCodes } from 'modules/event-ref-codes/hooks/useEventCodes.ts'
import { useEventCodesQueries } from 'modules/event-ref-codes/hooks/useEventCodesQueries.ts'
import { useRefCodes } from 'modules/event-ref-codes/hooks/useRefCodes.ts'
import { TableEventCodes } from 'modules/event-ref-codes/sections/TableEventCodes/TableEventCodes.component.tsx'
import { TableRefCodes } from 'modules/event-ref-codes/sections/TableRefCodes/TableRefCodes.component.tsx'

type TabsEventRefCodesProps = {
  refCodesManager: ReturnType<typeof useRefCodes>
  eventCodesManager: ReturnType<typeof useEventCodes>
  setValue: (value: number) => void
  value: number
}

export const TabsEventRefCodes = ({ refCodesManager, eventCodesManager, setValue, value }: TabsEventRefCodesProps) => {
  const { t } = useTranslations()

  const { state } = useLocationState<{ tab: number }>()

  const { eventCodes, isFetching: isFetchingEventCodes } = useEventCodesQueries()

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  useEffect(() => {
    if (state?.tab) {
      setValue(state.tab)
    }
  }, [])

  return (
    <Box display="flex" flexDirection="column" width="100%" height="100%">
      <Tabs value={value} onChange={handleChange} variant="fullWidth">
        <TabCustom label={t({ id: 'eventCodesTab' })} pillContent={eventCodes.length} {...a11yProps(t({ id: 'eventCodesTab' }))} isDisabled={value !== 0} />
        <TabCustom label={t({ id: 'refCodesTab' })} pillContent={refCodesManager.refCodes.length} {...a11yProps(t({ id: 'refCodesTab' }))} isDisabled={value !== 1} />
      </Tabs>
      <Divider />
      <Box display="flex" flexDirection="column" minHeight={0} mt={3} width="100%">
        <TabPanelCustom value={value} index={0}>
          <TableEventCodes
            data={eventCodes}
            isFetching={isFetchingEventCodes}
            onEventCodeDialogOpen={eventCodesManager.handleEventCodeDialogOpen}
            onEventCodeEdit={eventCodesManager.handleEventCodeEdit}
          />
          <DialogEventCodes
            eventCode={eventCodesManager.eventCode}
            eventCodes={eventCodesManager.eventCodes}
            onCancel={eventCodesManager.handleEventCodeDialogClose}
            onConfirm={eventCodesManager.handleEventCodeDialogConfirm}
            open={eventCodesManager.isEventCodeDialogOpen}
          />
        </TabPanelCustom>
        <TabPanelCustom value={value} index={1}>
          <TableRefCodes
            data={refCodesManager.refCodes}
            onRefCodeDialogOpen={refCodesManager.handleRefCodeDialogOpen}
            onRefCodeEdit={refCodesManager.handleRefCodeEdit}
            isFetching={refCodesManager.isFetching}
          />
          <DialogRefCodes
            refCode={refCodesManager.refCode}
            refCodes={refCodesManager.refCodes}
            onCancel={refCodesManager.handleRefCodeDialogClose}
            onConfirm={refCodesManager.handleRefCodeDialogConfirm}
            open={refCodesManager.isRefCodeDialogOpen}
          />
        </TabPanelCustom>
      </Box>
      <Snackbar
        open={eventCodesManager.snackbar.isSnackbarVisible}
        hint={eventCodesManager.snackbar.snackbar.hint}
        message={eventCodesManager.snackbar.snackbar.message}
        type={eventCodesManager.snackbar.snackbar.type}
        onClose={eventCodesManager.snackbar.handleSnackbarClose}
      />
      <Snackbar
        open={refCodesManager.snackbar.isSnackbarVisible}
        hint={refCodesManager.snackbar.snackbar.hint}
        message={refCodesManager.snackbar.snackbar.message}
        type={refCodesManager.snackbar.snackbar.type}
        onClose={refCodesManager.snackbar.handleSnackbarClose}
      />
    </Box>
  )
}
