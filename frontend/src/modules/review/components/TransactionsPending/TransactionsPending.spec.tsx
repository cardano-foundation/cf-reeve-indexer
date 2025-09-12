import { render, screen, waitFor } from '@testing-library/react'
import { it, vi } from 'vitest'

import { BatchStatistics, TransactionType } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'
import { server } from 'libs/mock-service-worker/server.ts'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { TransactionsPending } from 'modules/review/components/TransactionsPending/TransactionsPending.component'

vi.mock('modules/review/components/BatchContext/hooks/useBatchContext.tsx', () => ({
  useBatchContext: () => {
    const selectedBatchId = '15'
    const selectedBatchStat = BatchStatistics.PENDING
    return { selectedBatchId, setSelectedBatchId: vi.fn(), selectedBatchStat, setSelectedBatchStat: vi.fn() }
  }
}))

vi.mock('libs/models/batches-model/GetBatch/GetBatch.service.ts', () => ({
  useGetBatchModel: ({ batchId }: { batchId: string }) => ({
    batch: BATCHES_API_RESPONSE_MOCK.batchs.find((batch) => batch.id === batchId),
    refetch: vi.fn()
  })
}))

const TransactionsPendingWithProviders = () => {
  return (
    <TestWrapper>
      <TransactionsPending />
    </TestWrapper>
  )
}

// TODO: fix due to batch details changes
describe.skip('TransactionsInvalid', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterEach(() => {
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('renders without crashing', () => {
    render(<TransactionsPendingWithProviders />)
  })

  it('renders table when transactions are provided', async () => {
    render(<TransactionsPendingWithProviders />)

    await waitFor(() => {
      expect(screen.getByText('Transaction ID')).toBeInTheDocument()
      expect(screen.getByText('Transaction date')).toBeInTheDocument()
      expect(screen.getByText('Transaction type')).toBeInTheDocument()
      expect(screen.getByText('Total amount LCY')).toBeInTheDocument()
      expect(screen.getByText('Number of items')).toBeInTheDocument()
      expect(screen.getByText('Reason for pending')).toBeInTheDocument()
    })
  })

  it('renders transaction data correctly', async () => {
    render(<TransactionsPendingWithProviders />)

    expect(await screen.findByText('TXN002')).toBeInTheDocument()
    expect(screen.getByText(TransactionType.VENDOR_BILL)).toBeInTheDocument()
    expect(screen.getByText('200.00')).toBeInTheDocument()
    expect(screen.getByText('Missing document number')).toBeInTheDocument()
  })
})
