import { BatchStatistics, Status, TransactionType, ValidationStatus } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import {
  GetReconciledTransactionsApiResponse,
  ReconciliationStatus,
  TriggerReconciliationApiResponse
} from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'

export const TRIGGER_RECONCILIATION_RESPONSE_MOCK: TriggerReconciliationApiResponse = {
  message: 'Reconciliation triggered successfully',
  event: 'reconciliation_triggered',
  success: true,
  dateFrom: '2023-01-01',
  dateTo: '2023-01-31',
  error: {
    title: 'Error Title',
    status: {
      reasonPhrase: 'Bad Request',
      statusCode: 400
    },
    detail: 'Detailed error message',
    instance: 'instance-id',
    type: 'error-type',
    parameters: {} as never
  }
}

export const GET_RECONCILED_TRANSACTIONS_RESPONSE_MOCK: GetReconciledTransactionsApiResponse = {
  total: 2,
  statistic: {
    ok: 2,
    nok: 0,
    never: 0,
    total: 2,
    missingInERP: 1,
    inProcessing: 2,
    newInERP: 1,
    newVersionNotPublished: 1,
    newVersion: 1
  },
  transactions: [
    {
      id: '1',
      internalTransactionNumber: 'TXN001',
      itemRejection: false,
      entryDate: new Date().toISOString(),
      transactionType: TransactionType.CARD_CHARGE,
      validationStatus: ValidationStatus.VALIDATED,
      transactionApproved: true,
      ledgerDispatchApproved: true,
      amountTotalLcy: 100,
      status: Status.OK,
      statistic: BatchStatistics.APPROVE,
      items: [],
      violations: [],
      reconciliationSource: ReconciliationStatus.OK,
      reconciliationSink: ReconciliationStatus.OK,
      reconciliationFinalStatus: ReconciliationStatus.OK,
      reconciliationRejectionCode: [],
      reconciliationDate: '2023-01-01',
      dataSource: 'Oracle NetSuite'
    }
  ]
}
