import Box from '@mui/material/Box'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { ChipGroup } from 'libs/layout-kit/components/ChipGroup/ChipGroup.component.tsx'
import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ChipDateRange } from 'libs/ui-kit/components/ChipDateRange/ChipDateRange.component.tsx'
import { ChipList } from 'libs/ui-kit/components/ChipList/ChipList.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { ExtractedTransactions } from 'modules/extraction-results/components/ExtractedTransactions/ExtractedTransactions.component.tsx'
import { useExtractionResults } from 'modules/extraction-results/hooks/useExtractionResults.ts'
import { PATHS } from 'routes'

export const ViewExtractionResults = () => {
  const { t } = useTranslations()

  const navigate = useNavigate()

  const { accountCode, accountSubtype, accountType, costCenter, dateFrom, dateTo, project, snackbar, transactions, handleClose, isFetching, isSnackbarVisible } =
    useExtractionResults()

  if (!(dateFrom && dateTo)) {
    navigate(PATHS.DATA_EXPLORER_EXTRACTION)

    return null
  }

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.ButtonBack
          component={RouterLink}
          state={{ accountCode, accountSubtype, accountType, costCenter, dateFrom, dateTo, project }}
          to={PATHS.DATA_EXPLORER_EXTRACTION}
          replace
        />
        <LayoutAuth.Header.Details title={t({ id: 'extractionResultsViewTitle' })}>
          <ChipGroup>
            {dateFrom && dateTo && <ChipDateRange from={dateFrom} to={dateTo} />}
            {costCenter && costCenter.length > 0 && <ChipList items={costCenter} />}
            {project && project.length > 0 && <ChipList items={project} />}
            {accountType && accountType.length > 0 && <ChipList items={accountType.map((item) => t({ id: item }))} />}
            {accountSubtype && accountSubtype.length > 0 && <ChipList items={accountSubtype.map((item) => t({ id: item }))} />}
            {accountCode && accountCode.length > 0 && <ChipList items={accountCode} />}
          </ChipGroup>
        </LayoutAuth.Header.Details>
      </LayoutAuth.Header>
      <LayoutAuth.Main alignItems="flex-start" isHeightRestricted>
        <Box display="flex" flexDirection="column" height="100%" width="100%">
          <ExtractedTransactions rows={transactions} isLoading={isFetching} />
        </Box>
      </LayoutAuth.Main>
      {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
      <Snackbar key={snackbar.message} hint={snackbar.hint} message={snackbar.message} type={snackbar.type} onClose={handleClose} open={isSnackbarVisible} />
    </>
  )
}
