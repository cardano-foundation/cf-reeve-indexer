import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { ReactNode, SyntheticEvent, useState } from 'react'

import { BatchApiResponse, BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { IconApprove } from 'libs/form-kit/components/CardCounterApprove/CardCounterApprove.component.tsx'
import { IconInvalid } from 'libs/form-kit/components/CardCounterInvalid/CardCounterInvalid.component.tsx'
import { IconPending } from 'libs/form-kit/components/CardCounterPending/CardCounterPending.component.tsx'
import { IconPublish } from 'libs/form-kit/components/CardCounterPublish/CardCounterPublish.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { useBatchContext } from 'modules/review/components/BatchContext/hooks/useBatchContext.tsx'
import { TransactionsApprove } from 'modules/review/components/TransactionsApprove/TransactionsApprove.component.tsx'
import { TransactionsApproved } from 'modules/review/components/TransactionsApproved/TransactionsApproved.component'
import { TransactionsInvalid } from 'modules/review/components/TransactionsInvalid/TransactionsInvalid.component.tsx'
import { TransactionsPending } from 'modules/review/components/TransactionsPending/TransactionsPending.component.tsx'

interface CustomTabPanelProps {
  children?: ReactNode
  index: number
  value: number
}

export const CustomTabPanel = ({ children, value, index }: CustomTabPanelProps) => {
  return (
    <Box role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} height="100%" width="100%">
      {value === index && (
        <Box display="flex" height="100%" width="100%">
          {children}
        </Box>
      )}
    </Box>
  )
}

interface CustomTabProps {
  icon: ReactNode
  label: string
  pillContent?: string | number
  isDisabled: boolean
}

const CustomTab = ({ icon, label, pillContent, isDisabled, ...other }: CustomTabProps) => {
  const theme = useTheme()

  return (
    <Tab
      icon={
        <Box display="flex" alignItems="center">
          {icon}
          <Box ml={1} sx={{ textTransform: 'none' }}>
            {label}
          </Box>
          <Chip
            label={pillContent}
            variant="filled"
            sx={{
              ml: 1,
              backgroundColor: theme.palette.grey[200],
              color: !isDisabled ? 'primary.main' : isDisabled ? 'text.secondary' : 'primary.contrastText'
            }}
          />
        </Box>
      }
      {...other}
    />
  )
}

const a11yProps = (tabName: string) => {
  return {
    id: `tab-${tabName}`,
    'aria-controls': `tabpanel-${tabName}`
  }
}

const getTabIndex = (selectedBatchStat: BatchStatistics | undefined) => {
  switch (selectedBatchStat) {
    case BatchStatistics.APPROVE:
      return 0
    case BatchStatistics.PENDING:
      return 1
    case BatchStatistics.INVALID:
      return 2
    case BatchStatistics.PUBLISH:
      return 3
    default:
      return 0
  }
}

const getBatchStat = (value: number) => {
  switch (value) {
    case 0:
      return BatchStatistics.APPROVE
    case 1:
      return BatchStatistics.PENDING
    case 2:
      return BatchStatistics.INVALID
    case 3:
      return BatchStatistics.PUBLISH
    default:
      return BatchStatistics.APPROVE
  }
}

interface TabsBatchesReviewProps {
  batch: BatchApiResponse | null
}

export const TabsBatchesReview = ({ batch }: TabsBatchesReviewProps) => {
  const { selectedBatchStat, setSelectedBatchStat } = useBatchContext()
  const tabIndex = getTabIndex(selectedBatchStat)

  const [value, setValue] = useState(tabIndex)

  const { t } = useTranslations()

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue)
    setSelectedBatchStat(getBatchStat(newValue))
  }

  return (
    <Box display="flex" flexDirection="column" width="100%" height="100%">
      <Tabs value={value} onChange={handleChange} aria-label="custom tabs example" variant="fullWidth" sx={{ maxHeight: '56px', height: '100%', flex: '1 0 100%' }}>
        <CustomTab
          icon={<IconApprove isDisabled={value !== 0} hasBackground={tabIndex === 0} />}
          label={t({ id: 'readyToApprove' })}
          pillContent={batch?.batchStatistics.approve}
          {...a11yProps(t({ id: 'readyToApprove' }))}
          isDisabled={value !== 0}
        />
        <CustomTab
          icon={<IconPending isDisabled={value !== 1} hasBackground={tabIndex === 1} />}
          label={t({ id: 'pending' })}
          pillContent={batch?.batchStatistics.pending}
          {...a11yProps(t({ id: 'pending' }))}
          isDisabled={value !== 1}
        />
        <CustomTab
          icon={<IconInvalid isDisabled={value !== 2} hasBackground={tabIndex === 2} />}
          label={t({ id: 'invalid' })}
          pillContent={batch?.batchStatistics.invalid}
          {...a11yProps(t({ id: 'invalid' }))}
          isDisabled={value !== 2}
        />
        <CustomTab
          icon={<IconPublish isDisabled={value !== 3} hasBackground={tabIndex === 3} />}
          label={t({ id: 'approved' })}
          pillContent={batch?.batchStatistics.publish}
          {...a11yProps(t({ id: 'approved' }))}
          isDisabled={value !== 3}
        />
      </Tabs>
      <Divider />
      <Box display="flex" flexDirection="column" minHeight={0} mt={3} width="100%">
        <CustomTabPanel value={value} index={0}>
          <TransactionsApprove />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <TransactionsPending />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <TransactionsInvalid />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          <TransactionsApproved />
        </CustomTabPanel>
      </Box>
    </Box>
  )
}
