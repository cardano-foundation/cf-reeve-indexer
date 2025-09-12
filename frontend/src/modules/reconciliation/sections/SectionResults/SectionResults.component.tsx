import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tabs from '@mui/material/Tabs'
import { Danger, TickCircle } from 'iconsax-react'
import { SyntheticEvent, useState } from 'react'

import { ReconciliationFilter } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { a11yProps, TabCustom } from 'libs/form-kit/components/TabCustom/TabCustom.component.tsx'
import { TabPanelCustom } from 'libs/form-kit/components/TabPanelCustom/TabPanelCustom.component.tsx'
import { useGetReconciledTransactionsModel } from 'libs/models/reconciliation-model/GetReconciledTransactions/GetReconciledTransactions.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TabPanelTransactionsReconciled } from 'modules/reconciliation/sections/TabPanelTransactionsReconciled/TabPanelTransactionsReconciled.component.tsx'
import { TabPanelTransactionsUnreconciled } from 'modules/reconciliation/sections/TabPanelTransactionsUnreconciled/TabPanelTransactionsUnreconciled.component.tsx'

export const IconUnreconciled = ({ isDisabled }: { isDisabled: boolean }) => {
  const theme = useTheme()

  return (
    <Box display="flex" p={0.5} borderRadius={2} bgcolor={isDisabled ? 'transparent' : theme.palette.warning.main}>
      <Danger variant={isDisabled ? 'Outline' : 'Bold'} color={isDisabled ? theme.palette.action.disabled : theme.palette.primary.main} />
    </Box>
  )
}

export const IconReconciled = ({ isDisabled }: { isDisabled: boolean }) => {
  const theme = useTheme()

  return (
    <Box display="flex" p={0.5} borderRadius={2} bgcolor={isDisabled ? 'transparent' : theme.palette.success.main}>
      <TickCircle variant={isDisabled ? 'Outline' : 'Bold'} color={isDisabled ? theme.palette.action.disabled : theme.palette.primary.main} />
    </Box>
  )
}

interface SectionResultsProps {
  onReconciliationDialogOpen: () => void
  hasBeenReconciled: boolean | null
}

export const SectionResults = ({ onReconciliationDialogOpen, hasBeenReconciled }: SectionResultsProps) => {
  const selectedOrganisation = useSelectedOrganisation()

  const [value, setValue] = useState(0)

  const { t } = useTranslations()

  const { reconciledTransactions: transactionsReconciled } = useGetReconciledTransactionsModel({
    organisationId: selectedOrganisation,
    filter: ReconciliationFilter.UNRECONCILED
  })

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Box display="flex" flexDirection="column" minHeight={0} width="100%" height="100%">
      <Tabs value={value} onChange={handleChange} aria-label={t({ id: 'reconciliationTabs' })} variant="fullWidth">
        <TabCustom
          icon={<IconUnreconciled isDisabled={value !== 0} />}
          label={t({ id: 'unreconciled' })}
          pillContent={transactionsReconciled?.statistic.nok}
          {...a11yProps(t({ id: 'transactionsUnreconciled' }))}
          isDisabled={value !== 0}
        />
        <TabCustom
          icon={<IconReconciled isDisabled={value !== 1} />}
          label={t({ id: 'reconciled' })}
          pillContent={transactionsReconciled?.statistic.ok}
          {...a11yProps(t({ id: 'transactionsReconciled' }))}
          isDisabled={value !== 1}
        />
      </Tabs>
      <Divider />
      <Box display="flex" flexDirection="column" minHeight={0} mt={3} width="100%">
        <TabPanelCustom value={value} index={0}>
          <TabPanelTransactionsUnreconciled onReconciliationDialogOpen={onReconciliationDialogOpen} hasBeenReconciled={hasBeenReconciled} />
        </TabPanelCustom>
        <TabPanelCustom value={value} index={1}>
          <TabPanelTransactionsReconciled onReconciliationDialogOpen={onReconciliationDialogOpen} hasBeenReconciled={hasBeenReconciled} />
        </TabPanelCustom>
      </Box>
    </Box>
  )
}
