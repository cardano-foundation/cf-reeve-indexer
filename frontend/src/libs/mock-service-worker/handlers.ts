import { batchMock, batchesMock, batchesReprocessMock } from 'libs/mock-service-worker/handlers/batchesMock.ts'
import { extractTransactionsMock } from 'libs/mock-service-worker/handlers/extractTransactionsMock.ts'
import { organisationMock } from 'libs/mock-service-worker/handlers/organisationMock.ts'
import { getReconciledTransactionsMock, triggerReconciliationMock } from 'libs/mock-service-worker/handlers/reconciliationMock.ts'
import { transactionsRejectionReasonsMock } from 'libs/mock-service-worker/handlers/transactionsRejectionReasonsMock.ts'
import { transactionTypesMock } from 'libs/mock-service-worker/handlers/transactionTypesMock.ts'

export const handlers = [
  organisationMock,
  transactionTypesMock,
  extractTransactionsMock,
  transactionsRejectionReasonsMock,
  batchMock,
  batchesMock,
  batchesReprocessMock,
  triggerReconciliationMock,
  getReconciledTransactionsMock
]
