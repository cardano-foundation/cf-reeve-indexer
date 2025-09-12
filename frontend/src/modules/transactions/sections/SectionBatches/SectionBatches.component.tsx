import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Maximize4 } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetBatchesModel } from 'libs/models/batches-model/GetBatches/GetBatches.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { TableBatchesRecentlyImported } from 'modules/transactions/components/TableBatchesRecentlyImported/TableBatchesRecentlyImported.component.tsx'
import { PATHS } from 'routes'

export const SectionBatches = () => {
  const selectedOrganisation = useSelectedOrganisation()

  const { batches, isFetching } = useGetBatchesModel(
    {
      organisationId: selectedOrganisation,
      batchStatistics: [BatchStatistics.APPROVE, BatchStatistics.PENDING, BatchStatistics.INVALID, BatchStatistics.PUBLISH]
    },
    { page: 0, size: 5 }
  )

  const { t } = useTranslations()

  const theme = useTheme()

  return (
    <Box component="section" display="flex" flexDirection="column" gap={3}>
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Box>
          <Typography component="h3" variant="h2">
            {t({ id: 'batchesSectionTitle' })}
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {t({ id: 'batchesSectionDescription' })}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="View all batches" placement="top">
            <ButtonIcon aria-label="All batches" component={RouterLink} to={PATHS.TRANSACTIONS_BATCHES} variant="outlined">
              <Maximize4 color={theme.palette.action.active} size={24} variant="Outline" />
            </ButtonIcon>
          </Tooltip>
        </Box>
      </Box>
      <TableBatchesRecentlyImported data={batches} isFetching={isFetching} />
    </Box>
  )
}
