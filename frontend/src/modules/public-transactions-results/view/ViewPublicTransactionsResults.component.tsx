import Box from '@mui/material/Box'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { publicTransactionsIllustration } from 'assets/images'
import { ChipGroup } from 'libs/layout-kit/components/ChipGroup/ChipGroup.component.tsx'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { ChipAmountRange } from 'libs/ui-kit/components/ChipAmountRange/ChipAmountRange.component.tsx'
import { ChipDateRange } from 'libs/ui-kit/components/ChipDateRange/ChipDateRange.component.tsx'
import { ChipList } from 'libs/ui-kit/components/ChipList/ChipList.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { SearchedTransactions } from 'modules/public-transactions-results/components/SearchedTransactions/SearchedTransactions.component.tsx'
import { usePublicTransactionsResults } from 'modules/public-transactions-results/hooks/usePublicTransactionsResults.ts'
import { PATHS } from 'routes'

export const ViewPublicTransactionsResults = () => {
  const { t } = useTranslations()

  const navigate = useNavigate()

  const {
    blockchainHash,
    currency,
    dateFrom,
    dateTo,
    maxAmount,
    minAmount,
    pagination,
    snackbar,
    transactions,
    total,
    handleClose,
    handlePagination,
    hasEmptyPageState,
    isFetching,
    isSnackbarVisible
  } = usePublicTransactionsResults()

  if (!(dateFrom && dateTo)) {
    navigate(PATHS.PUBLIC_TRANSACTIONS)

    return null
  }

  return (
    <>
      <LayoutPublic.Header isPublic>
        <LayoutPublic.Header.ButtonBack
          component={RouterLink}
          state={{ blockchainHash, currency, dateFrom, dateTo, maxAmount, minAmount }}
          to={PATHS.PUBLIC_TRANSACTIONS}
          replace
        />
        <LayoutPublic.Header.Details title={t({ id: 'publicTransactionsResultsViewTitle' })}>
          <ChipGroup>
            {dateFrom && dateTo && <ChipDateRange from={dateFrom} to={dateTo} />}
            {currency && <Chip label={currency} />}
            {(maxAmount || minAmount) && <ChipAmountRange max={maxAmount} min={minAmount} />}
            {blockchainHash && <ChipList items={blockchainHash.split(', ')} />}
          </ChipGroup>
        </LayoutPublic.Header.Details>
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6} isHeightRestricted>
        {hasEmptyPageState ? (
          <EmptyStatePage
            asset={<Box alt={t({ id: 'noPublicTransactionsMessage' })} component="img" maxWidth="47.5rem" src={publicTransactionsIllustration} width="100%" />}
            hint={t({ id: 'noPublicTransactionsHint' })}
            message={t({ id: 'noPublicTransactionsMessage' })}
          />
        ) : (
          <SearchedTransactions pagination={pagination} rows={transactions} total={total} onPagination={handlePagination} isLoading={isFetching} />
        )}
      </LayoutPublic.Main>
      {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
      <Snackbar key={snackbar.message} hint={snackbar.hint} message={snackbar.message} type={snackbar.type} onClose={handleClose} open={isSnackbarVisible} />
    </>
  )
}
