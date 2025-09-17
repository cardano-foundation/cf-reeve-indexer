import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tabs from '@mui/material/Tabs'
import { SyntheticEvent, useEffect, useState } from 'react'

import { useLocationState } from 'hooks'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { IconPending } from 'libs/form-kit/components/CardCounterPending/CardCounterPending.component.tsx'
import { IconPublish } from 'libs/form-kit/components/CardCounterPublish/CardCounterPublish.component.tsx'
import { IconPublished } from 'libs/form-kit/components/CardCounterPublished/CardCounterPublished.component.tsx'
import { a11yProps, TabCustom } from 'libs/form-kit/components/TabCustom/TabCustom.component.tsx'
import { TabPanelCustom } from 'libs/form-kit/components/TabPanelCustom/TabPanelCustom.component.tsx'
import { useGetReportsModel } from 'libs/models/reports-model/GetReportsModel/GetReports.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TabPanelReportsPending } from 'modules/reports-publish/sections/TabPanelReportsPending/TabPanelReportsPending.component.tsx'
import { TabPanelReportsPublish } from 'modules/reports-publish/sections/TabPanelReportsPublish/TabPanelReportsPublish.component.tsx'
import { TabPanelReportsPublished } from 'modules/reports-publish/sections/TabPanelReportsPublished/TabPanelReportsPublished.component.tsx'

export const TabsReports = () => {
  const [value, setValue] = useState(0)

  const { state } = useLocationState<{ tab: number }>()
  const selectedOrganisation = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'

  const { t } = useTranslations()

  const { reports } = useGetReportsModel({ organisationId: selectedOrganisation })

  const reportsPublish = (reports?.report ?? []).filter((report) => !report.publish && report.canBePublish)
  const reportsPending = (reports?.report ?? []).filter((report) => !report.publish && !report.canBePublish)
  const reportsPublished = (reports?.report ?? []).filter((report) => report.publish)

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
      <Tabs value={value} onChange={handleChange} aria-label="custom tabs example" variant="fullWidth" sx={{ maxHeight: '56px', height: '100%', flex: '1 0 100%' }}>
        <TabCustom
          icon={<IconPublish isDisabled={value !== 0} hasBackground={value === 0} />}
          label={t({ id: 'batchPublish' })}
          pillContent={reportsPublish.length}
          {...a11yProps(t({ id: 'publish' }))}
          isDisabled={value !== 0}
        />
        <TabCustom
          icon={<IconPending isDisabled={value !== 1} hasBackground={value === 1} />}
          label={t({ id: 'pending' })}
          pillContent={reportsPending.length}
          {...a11yProps(t({ id: 'pending' }))}
          isDisabled={value !== 1}
        />
        <TabCustom
          icon={<IconPublished isDisabled={value !== 2} hasBackground={value === 2} />}
          label={t({ id: 'batchPublished' })}
          pillContent={reportsPublished.length}
          {...a11yProps(t({ id: 'published' }))}
          isDisabled={value !== 2}
        />
      </Tabs>
      <Divider />
      <Box display="flex" flexDirection="column" minHeight={0} mt={3} width="100%">
        <TabPanelCustom value={value} index={0}>
          <TabPanelReportsPublish />
        </TabPanelCustom>
        <TabPanelCustom value={value} index={1}>
          <TabPanelReportsPending />
        </TabPanelCustom>
        <TabPanelCustom value={value} index={2}>
          <TabPanelReportsPublished />
        </TabPanelCustom>
      </Box>
    </Box>
  )
}
