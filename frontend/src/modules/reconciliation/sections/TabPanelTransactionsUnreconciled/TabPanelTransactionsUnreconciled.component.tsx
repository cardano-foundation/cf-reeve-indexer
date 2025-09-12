import { ReconciliationFilter } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useGetReconciledTransactionsModel } from 'libs/models/reconciliation-model/GetReconciledTransactions/GetReconciledTransactions.service.ts'
import { TableTransactionsReconcile } from 'modules/reconciliation/components/TableTransactionsReconcile/TableTransactionsReconcile.component.tsx'

interface TabPanelTransactionsUnreconciledProps {
  onReconciliationDialogOpen: () => void
  hasBeenReconciled: boolean | null
}

export const TabPanelTransactionsUnreconciled = ({ onReconciliationDialogOpen, hasBeenReconciled }: TabPanelTransactionsUnreconciledProps) => {
  const { page, rowsPerPage, handlePagination } = usePagination()
  const selectedOrganisation = useSelectedOrganisation()

  const { reconciledTransactions, isFetching } = useGetReconciledTransactionsModel(
    {
      organisationId: selectedOrganisation,
      filter: ReconciliationFilter.UNRECONCILED
    },
    { page: page, size: rowsPerPage }
  )

  return (
    <TableTransactionsReconcile
      data={reconciledTransactions}
      pagination={{ handlePagination }}
      onReconciliationDialogOpen={onReconciliationDialogOpen}
      isFetching={isFetching}
      hasBeenReconciled={hasBeenReconciled}
      isUnreconciled
    />
  )
}
