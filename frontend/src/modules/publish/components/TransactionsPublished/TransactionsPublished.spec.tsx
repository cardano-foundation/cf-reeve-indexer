import { render, screen, waitFor } from '@testing-library/react'
import { it, vi } from 'vitest'

import { BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'
import { server } from 'libs/mock-service-worker/server.ts'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { TransactionsPublished } from 'modules/publish/components/TransactionsPublished/TransactionsPublished.component.tsx'

vi.mock('modules/publish/components/BatchPublishContext/hooks/useBatchPublishContext.tsx', () => ({
  useBatchPublishContext: () => {
    const selectedBatchId = '1'
    return { selectedBatchId, setSelectedBatchId: vi.fn() }
  }
}))

vi.mock('libs/models/batches-model/GetBatch/GetBatch.service.ts', () => ({
  useGetBatchModel: ({ batchId }: { batchId: string }) => ({
    batch: BATCHES_API_RESPONSE_MOCK.batchs.find((batch) => batch.id === batchId),
    refetch: vi.fn()
  })
}))

const TransactionsPublishedWithProviders = () => {
  return (
    <TestWrapper>
      <TransactionsPublished />
    </TestWrapper>
  )
}

// TODO: fix due to batch details changes
describe.skip('TransactionsPublished', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterEach(() => {
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('renders without crashing', () => {
    render(<TransactionsPublishedWithProviders />)
  })

  it('renders table headers correctly', async () => {
    render(<TransactionsPublishedWithProviders />)

    await waitFor(() => {
      expect(screen.getByText('Transaction ID')).toBeInTheDocument()
      expect(screen.getByText('Transaction date')).toBeInTheDocument()
      expect(screen.getByText('Transaction type')).toBeInTheDocument()
      expect(screen.getByText('Total amount LCY')).toBeInTheDocument()
      expect(screen.getByText('Number of items')).toBeInTheDocument()
    })
  })
})
