import { ReconciliationFilter } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useGetReconciledTransactionsModel } from 'libs/models/reconciliation-model/GetReconciledTransactions/GetReconciledTransactions.service.ts'
import { TableTransactionsReconcile } from 'modules/reconciliation/components/TableTransactionsReconcile/TableTransactionsReconcile.component.tsx'

interface TabPanelTransactionsReconciledProps {
  onReconciliationDialogOpen: () => void
  hasBeenReconciled: boolean | null
}

export const TabPanelTransactionsReconciled = ({ onReconciliationDialogOpen, hasBeenReconciled }: TabPanelTransactionsReconciledProps) => {
  const { page, rowsPerPage, handlePagination } = usePagination()
  const selectedOrganisation = useSelectedOrganisation()

  const { reconciledTransactions, isFetching } = useGetReconciledTransactionsModel(
    {
      organisationId: selectedOrganisation,
      filter: ReconciliationFilter.RECONCILED
    },
    { page: page, size: rowsPerPage }
  )

  return (
    <TableTransactionsReconcile
      data={reconciledTransactions}
      pagination={{ handlePagination }}
      onReconciliationDialogOpen={onReconciliationDialogOpen}
      hasBeenReconciled={hasBeenReconciled}
      isFetching={isFetching}
    />
  )
}
