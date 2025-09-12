import { render, screen, waitFor } from '@testing-library/react'
import { it, vi } from 'vitest'

import { BatchStatistics, TransactionType } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'
import { ORGANISATIONS_MOCK } from 'libs/mock-service-worker/mocks/organisations.mock.ts'
import { server } from 'libs/mock-service-worker/server.ts'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { TransactionsApprove } from 'modules/review/components/TransactionsApprove/TransactionsApprove.component.tsx'

vi.mock('modules/review/components/BatchContext/hooks/useBatchContext.tsx', () => ({
  useBatchContext: () => {
    const selectedBatchId = '15'
    const selectedBatchStat = BatchStatistics.APPROVE

    return { selectedBatchId, setSelectedBatchId: vi.fn(), selectedBatchStat, setSelectedBatchStat: vi.fn() }
  }
}))

vi.mock('modules/review/components/TransactionsContext/hooks/useTransactionsContext.tsx', () => ({
  useTransactionsContext: () => {
    const selectedTransactions = [{ id: '3' }]

    return { selectedTransactions, setSelectedTransactions: vi.fn() }
  }
}))

vi.mock('libs/models/batches-model/GetBatches/GetBatches.service.ts', () => ({
  useGetBatchesModel: () => ({
    batches: BATCHES_API_RESPONSE_MOCK,
    refetch: () => {}
  })
}))

vi.mock('libs/models/organisation-model/GetOrganisations/GetOrganisations.service.ts', () => ({
  useGetOrganisationsModel: () => ({
    organisations: ORGANISATIONS_MOCK,
    isFetching: false
  })
}))

vi.mock('libs/models/batches-model/GetBatch/GetBatch.service.ts', () => ({
  useGetBatchModel: ({ batchId }: { batchId: string }) => ({
    batch: BATCHES_API_RESPONSE_MOCK.batchs.find((batch) => batch.id === batchId),
    refetch: vi.fn()
  })
}))

vi.mock('libs/models/transactions-model/ApproveTransactions/ApproveTransactions.service.ts', () => ({
  useApproveTransactionsModel: () => ({
    approveTransactions: vi.fn()
  })
}))

const TransactionsApproveWithProviders = () => {
  return (
    <TestWrapper>
      <TransactionsApprove />
    </TestWrapper>
  )
}

// TODO: fix due to batch details changes
describe.skip('TransactionsApprove', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterEach(() => {
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('renders without crashing', () => {
    render(<TransactionsApproveWithProviders />)
  })

  it('renders table when transactions are provided', async () => {
    render(<TransactionsApproveWithProviders />)

    await waitFor(() => {
      expect(screen.getByText('Transaction ID')).toBeInTheDocument()
      expect(screen.getByText('Transaction date')).toBeInTheDocument()
      expect(screen.getByText('Transaction type')).toBeInTheDocument()
      expect(screen.getByText('Total amount LCY')).toBeInTheDocument()
      expect(screen.getByText('Number of items')).toBeInTheDocument()
    })
  })

  it('renders transaction data correctly', async () => {
    render(<TransactionsApproveWithProviders />)

    expect(await screen.findByText('TXN001')).toBeInTheDocument()
    expect(screen.getByText(TransactionType.CARD_CHARGE)).toBeInTheDocument()
    expect(screen.getByText('100.00')).toBeInTheDocument()

    expect(await screen.findByText('TXN003')).toBeInTheDocument()
    expect(screen.getByText(TransactionType.CARD_CHARGE)).toBeInTheDocument()
    expect(screen.getByText('150.00')).toBeInTheDocument()
  })

  it('renders Approve buttons label', async () => {
    render(<TransactionsApproveWithProviders />)

    const approveButtons = await screen.findAllByRole('button', { name: /Approve/i })
    expect(approveButtons).toHaveLength(5)
  })
})
