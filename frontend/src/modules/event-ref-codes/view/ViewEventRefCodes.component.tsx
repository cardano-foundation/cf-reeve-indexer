import Box from '@mui/material/Box'
import { useState } from 'react'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { TabsEventRefCodes } from 'libs/ui-kit/components/TabsEventRefCodes/TabsEventRefCodes.component.tsx'
import { useEventCodes } from 'modules/event-ref-codes/hooks/useEventCodes.ts'
import { useRefCodes } from 'modules/event-ref-codes/hooks/useRefCodes.ts'

export const ViewEventRefCodes = () => {
  const { t } = useTranslations()
  const refCodesManager = useRefCodes()
  const eventCodesManager = useEventCodes()
  const [value, setValue] = useState(0)

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details title={t({ id: 'eventRefCodesViewTitle' })} />
        {value === 1 && refCodesManager.hasRefCodes && !refCodesManager.isFetching && (
          <Box alignItems="center" display="flex" gap={1}>
            <ButtonPrimary onClick={refCodesManager.handleRefCodeDialogOpen} disabled={!hasPermission('event_codes', 'create')}>
              {t({ id: 'add' })}
            </ButtonPrimary>
          </Box>
        )}
        {value === 0 && eventCodesManager.hasEventCodes && !eventCodesManager.isFetching && (
          <Box alignItems="center" display="flex" gap={1}>
            <ButtonPrimary onClick={eventCodesManager.handleEventCodeDialogOpen} disabled={!hasPermission('event_codes', 'create')}>
              {t({ id: 'add' })}
            </ButtonPrimary>
          </Box>
        )}
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={3} isHeightRestricted>
        <TabsEventRefCodes refCodesManager={refCodesManager} eventCodesManager={eventCodesManager} value={value} setValue={setValue} />
      </LayoutAuth.Main>
    </>
  )
}
