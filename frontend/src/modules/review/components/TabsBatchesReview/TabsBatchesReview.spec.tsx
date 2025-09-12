import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { it, vi } from 'vitest'

import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'
import { server } from 'libs/mock-service-worker/server.ts'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { TabsBatchesReview } from 'modules/review/components/TabsBatchesReview/TabsBatchesReview.component.tsx'

const SELECTED_BATCH_ID = '15'

vi.mock('modules/review/components/BatchContext/hooks/useBatchContext.tsx', () => ({
  useBatchContext: () => {
    const selectedBatchId = SELECTED_BATCH_ID
    const selectedBatchStat = BatchStatistics.APPROVE
    return { selectedBatchId, setSelectedBatchId: vi.fn(), selectedBatchStat, setSelectedBatchStat: vi.fn() }
  }
}))

const TabsBatchesReviewWithProviders = () => {
  return (
    <TestWrapper>
      <TabsBatchesReview batch={BATCHES_API_RESPONSE_MOCK.batchs.find((batch) => batch.id === SELECTED_BATCH_ID) ?? null} />
    </TestWrapper>
  )
}

// TODO: fix due to batch details changes
describe.skip('TabsBatchesReview', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterEach(() => {
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('renders without crashing', () => {
    render(<TabsBatchesReviewWithProviders />)
  })

  it('renders tabs and their content correctly', async () => {
    render(<TabsBatchesReviewWithProviders />)

    await waitFor(() => {
      expect(screen.getByText('Ready to approve')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Invalid')).toBeInTheDocument()
      expect(screen.getByText('Approved')).toBeInTheDocument()
    })

    expect(screen.getByText('Transaction ID')).toBeInTheDocument()
    expect(screen.getByText('Transaction date')).toBeInTheDocument()
    expect(screen.getByText('Transaction type')).toBeInTheDocument()
    expect(screen.getByText('Total amount LCY')).toBeInTheDocument()
    expect(screen.getByText('Number of items')).toBeInTheDocument()
  })

  it('changes tab on click', async () => {
    render(<TabsBatchesReviewWithProviders />)

    const pendingTab = screen.getByRole('tab', { name: /pending/i })
    fireEvent.click(pendingTab)

    await waitFor(() => {
      expect(screen.getByText('Transaction ID')).toBeInTheDocument()
      expect(screen.getByText('Transaction date')).toBeInTheDocument()
      expect(screen.getByText('Transaction type')).toBeInTheDocument()
      expect(screen.getByText('Total amount LCY')).toBeInTheDocument()
      expect(screen.getByText('Number of items')).toBeInTheDocument()
    })
  })

  it('when clicking Ready to approve tab shows specific approve related content', async () => {
    render(<TabsBatchesReviewWithProviders />)

    const readyToApproveTab = screen.getByRole('tab', { name: /ready to approve/i })
    fireEvent.click(readyToApproveTab)

    await waitFor(() => {
      const approveButtons = screen.getAllByRole('button', { name: /approve/i })
      expect(approveButtons).toHaveLength(5)
    })
  })
})
