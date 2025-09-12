import { useQueryClient } from '@tanstack/react-query'

import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting'
import { useApproveTransactionsModel } from 'libs/models/transactions-model/ApproveTransactions/ApproveTransactions.service.ts'
import { useRejectTransactionsModel } from 'libs/models/transactions-model/RejectTransactions/RejectTransactions.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { SnackbarActionType, useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { useBatchContext } from 'modules/review/components/BatchContext/hooks/useBatchContext.tsx'
import { TableBatchReviewApprove } from 'modules/review/components/TableBatchReviewApprove/TableBatchReviewApprove.component.tsx'
import { useTransactionsContext } from 'modules/review/components/TransactionsContext/hooks/useTransactionsContext.tsx'
import { useBatchDetailsContext } from 'modules/review/hooks/useBatchDetailsContext.ts'
import { useBatchDetailsQueries } from 'modules/review/hooks/useBatchDetailsQueries.ts'

export const TransactionsApprove = () => {
  const queryClient = useQueryClient()

  const { selectedBatchId } = useBatchContext()
  const { filters, quickFilters, areFiltersSubmitted } = useBatchDetailsContext()
  const { transactionsRejectionReasons, setSelectedTransactions, setTransactionsRejectionReasons } = useTransactionsContext()

  const { t } = useTranslations()

  const { page, rowsPerPage, handlePagination } = usePagination()

  const { sortBy, sortOrder, handleSorting } = useSorting({ field: 'entryDate', sort: 'desc' })

  const { batch, isFetching } = useBatchDetailsQueries({
    filters,
    quickFilters,
    pagination: { page, size: rowsPerPage },
    sorting: { sortBy, sortOrder },
    selectedBatchId,
    status: [BatchStatistics.APPROVE],
    areFiltersSubmitted
  })

  const { approveTransactions } = useApproveTransactionsModel()

  const { rejectTransaction } = useRejectTransactionsModel()

  const { isSnackbarVisible, showSnackbar, handleClose, snackbarActionType, setSnackbarActionType } = useSnackbar()

  const selectedOrganisation = useSelectedOrganisation()

  const handleApproveTransaction = (transactionId: string) => {
    setSnackbarActionType(SnackbarActionType.APPROVE)

    return approveTransactions(
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
          queryClient.invalidateQueries({ queryKey: ['BATCH'] })
          showSnackbar()
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
      <TableBatchReviewApprove
        data={batch}
        pagination={{ handlePagination }}
        sorting={{ handleSorting }}
        onApproveTransaction={handleApproveTransaction}
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
        message={t({ id: snackbarActionType === SnackbarActionType.APPROVE ? 'transactionApproved' : 'transactionRejected' })}
      />
    </>
  )
}
