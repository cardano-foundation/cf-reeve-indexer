import { ReconciliationFilter } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetReconciledTransactionsModel } from 'libs/models/reconciliation-model/GetReconciledTransactions/GetReconciledTransactions.service.ts'

export const useReconciliationQueries = () => {
  const selectedOrganisation = useSelectedOrganisation()

  const { reconciledTransactions, isFetching: isReconciledTransactionsFetching } = useGetReconciledTransactionsModel({
    organisationId: selectedOrganisation,
    filter: ReconciliationFilter.UNRECONCILED
  })

  const hasBeenReconciled = reconciledTransactions && reconciledTransactions.statistic.never !== reconciledTransactions.total

  return {
    hasBeenReconciled,
    isFetching: isReconciledTransactionsFetching
  }
}
