import { BatchStatus } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { TRANSACTIONS_MOCK } from 'libs/mock-service-worker/mocks/transactions.mock.ts'

export const BATCH_MOCK = {
  id: '1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'system',
  updateBy: 'system',
  organisationId: 'org1',
  status: BatchStatus.COMPLETE,
  batchStatistics: {
    approve: 5,
    pending: 5,
    invalid: 5,
    publish: 5,
    published: 5,
    total: 5
  },
  filteringParameters: {
    transactionTypes: ['CardCharge'],
    from: new Date().toISOString(),
    to: new Date().toISOString(),
    accountingPeriodFrom: new Date().toISOString(),
    accountingPeriodTo: new Date().toISOString(),
    transactionNumbers: ['CARDCH565', 'CARDCHRG159', 'CARDHY777', 'VENDBIL119']
  },
  transactions: TRANSACTIONS_MOCK
}

export const BATCHES_MOCK = Array.from({ length: 15 }, (_, i) => ({
  ...BATCH_MOCK,
  id: (i + 1).toString()
}))

export const BATCH_REPROCESS_RESPONSE_MOCK = {
  batchId: '1',
  error: null,
  status: 'success'
}

export const BATCHES_API_RESPONSE_MOCK = {
  total: 15,
  batchs: BATCHES_MOCK
}

export const BATCHES_API_RESPONSE_NO_BATCHES_MOCK = {
  total: 15,
  batchs: []
}
