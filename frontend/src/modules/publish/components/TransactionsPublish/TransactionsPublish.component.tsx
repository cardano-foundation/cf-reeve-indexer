import { useQueryClient } from '@tanstack/react-query'

import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting.ts'
import { usePublishTransactionsModel } from 'libs/models/transactions-model/PublishTransactions/PublishTransactions.service.ts'
import { useRejectTransactionsModel } from 'libs/models/transactions-model/RejectTransactions/RejectTransactions.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { SnackbarActionType, useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { useBatchPublishContext } from 'modules/publish/components/BatchPublishContext/hooks/useBatchPublishContext.tsx'
import { TableBatchPublishApprove } from 'modules/publish/components/TableBatchPublishApprove/TableBatchPublishApprove.component.tsx'
import { useTransactionsPublishContext } from 'modules/publish/components/TransactionsPublishContext/hooks/useTransactionsPublishContext.tsx'
import { useBatchDetailsContext } from 'modules/review/hooks/useBatchDetailsContext.ts'
import { useBatchDetailsQueries } from 'modules/review/hooks/useBatchDetailsQueries.ts'

export const TransactionsPublish = () => {
  const queryClient = useQueryClient()

  const { t } = useTranslations()

  const { selectedBatchId } = useBatchPublishContext()
  const { filters, quickFilters, areFiltersSubmitted } = useBatchDetailsContext()
  const { transactionsRejectionReasons, setSelectedTransactions, setTransactionsRejectionReasons } = useTransactionsPublishContext()

  const { page, rowsPerPage, handlePagination } = usePagination()

  const { sortBy, sortOrder, handleSorting } = useSorting({ field: 'entryDate', sort: 'desc' })

  const { batch, refetch, isFetching } = useBatchDetailsQueries({
    filters,
    quickFilters,
    pagination: { page, size: rowsPerPage },
    sorting: { sortBy, sortOrder },
    selectedBatchId,
    status: [BatchStatistics.PUBLISH],
    areFiltersSubmitted
  })

  const { isSnackbarVisible, showSnackbar, handleClose, snackbarActionType, setSnackbarActionType } = useSnackbar()

  const { publishTransactions } = usePublishTransactionsModel()

  const selectedOrganisation = useSelectedOrganisation()

  const handlePublishTransaction = (transactionId: string) => {
    setSnackbarActionType(SnackbarActionType.PUBLISH)

    return publishTransactions(
      {
        organisationId: selectedOrganisation,
        transactionIds: [{ id: transactionId }]
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['BATCH'] })
          showSnackbar()
        }
      }
    )
  }

  const { rejectTransaction } = useRejectTransactionsModel()

  const handleRejectTransaction = (transactionId: string) => {
    setSnackbarActionType(SnackbarActionType.REJECT)

    return rejectTransaction(
      {
        organisationId: selectedOrganisation,
        transactionId: transactionId,
        transactionItemsRejections: transactionsRejectionReasons
      },
      {
        onSuccess: () => {
          showSnackbar()
          return refetch()
        }
      }
    )
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    const selections = selectedIds.map((id) => ({ id }))

    setSelectedTransactions(selections)
  }

  return (
    <>
      <TableBatchPublishApprove
        data={batch}
        pagination={{ handlePagination }}
        sorting={{ handleSorting }}
        onPublishTransaction={handlePublishTransaction}
        onRejectTransaction={handleRejectTransaction}
        onTransactionRejectionReasonsChange={setTransactionsRejectionReasons}
        onSelectionChange={handleSelectionChange}
        transactionsRejectionReasons={transactionsRejectionReasons}
        isFetching={isFetching}
      />
      {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
      <Snackbar
        open={isSnackbarVisible}
        onClose={handleClose}
        message={t({ id: snackbarActionType === SnackbarActionType.PUBLISH ? 'transactionPublished' : 'transactionRejected' })}
      />
    </>
  )
}
