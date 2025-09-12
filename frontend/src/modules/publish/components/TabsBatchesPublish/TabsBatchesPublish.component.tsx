import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tabs from '@mui/material/Tabs'
import { SyntheticEvent, useState } from 'react'

import { BatchApiResponse, BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { IconPublish } from 'libs/form-kit/components/CardCounterPublish/CardCounterPublish.component.tsx'
import { IconPublished } from 'libs/form-kit/components/CardCounterPublished/CardCounterPublished.component.tsx'
import { a11yProps, TabCustom } from 'libs/form-kit/components/TabCustom/TabCustom.component.tsx'
import { TabPanelCustom } from 'libs/form-kit/components/TabPanelCustom/TabPanelCustom.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { useBatchPublishContext } from 'modules/publish/components/BatchPublishContext/hooks/useBatchPublishContext.tsx'
import { TransactionsPublish } from 'modules/publish/components/TransactionsPublish/TransactionsPublish.component.tsx'
import { TransactionsPublished } from 'modules/publish/components/TransactionsPublished/TransactionsPublished.component.tsx'

const getTabIndex = (selectedBatchStat: BatchStatistics | undefined) => {
  switch (selectedBatchStat) {
    case BatchStatistics.PUBLISH:
      return 0
    case BatchStatistics.PUBLISHED:
      return 1
    default:
      return 0
  }
}

interface TabsBatchesPublishProps {
  batch: BatchApiResponse | null
}

export const TabsBatchesPublish = ({ batch }: TabsBatchesPublishProps) => {
  const { selectedBatchStat, setSelectedBatchStat } = useBatchPublishContext()
  const tabIndex = getTabIndex(selectedBatchStat)

  const [value, setValue] = useState(tabIndex)

  const { t } = useTranslations()

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    if (newValue === 0) setSelectedBatchStat(BatchStatistics.PUBLISH)
    if (newValue === 1) setSelectedBatchStat(BatchStatistics.PUBLISHED)

    setValue(newValue)
  }

  return (
    <Box display="flex" flexDirection="column" width="100%" height="100%">
      <Tabs value={value} onChange={handleChange} aria-label="custom tabs example" variant="fullWidth" sx={{ maxHeight: '56px', height: '100%', flex: '1 0 100%' }}>
        <TabCustom
          icon={<IconPublish isDisabled={value !== 0} hasBackground={value === 0} />}
          label={t({ id: 'batchPublish' })}
          pillContent={batch?.batchStatistics.publish}
          {...a11yProps(t({ id: 'batchPublish' }))}
          isDisabled={value !== 0}
        />
        <TabCustom
          icon={<IconPublished isDisabled={value !== 1} hasBackground={value === 1} />}
          label={t({ id: 'batchPublished' })}
          pillContent={batch?.batchStatistics.published}
          {...a11yProps(t({ id: 'batchPublished' }))}
          isDisabled={value !== 1}
        />
      </Tabs>
      <Divider />
      <Box display="flex" flexDirection="column" minHeight={0} mt={3} width="100%">
        <TabPanelCustom value={value} index={0}>
          <TransactionsPublish />
        </TabPanelCustom>
        <TabPanelCustom value={value} index={1}>
          <TransactionsPublished />
        </TabPanelCustom>
      </Box>
    </Box>
  )
}
