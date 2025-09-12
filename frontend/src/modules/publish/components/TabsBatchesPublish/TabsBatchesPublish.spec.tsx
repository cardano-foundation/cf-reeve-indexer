import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { it, vi } from 'vitest'

import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'
import { server } from 'libs/mock-service-worker/server.ts'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { TabsBatchesPublish } from 'modules/publish/components/TabsBatchesPublish/TabsBatchesPublish.component.tsx'

const SELECTED_BATCH_ID = '15'

vi.mock('modules/publish/components/BatchPublishContext/hooks/useBatchPublishContext.tsx', () => ({
  useBatchPublishContext: () => {
    const selectedBatchId = SELECTED_BATCH_ID
    const selectedBatchStat = BatchStatistics.PUBLISH
    return { selectedBatchId, setSelectedBatchId: vi.fn(), selectedBatchStat, setSelectedBatchStat: vi.fn() }
  }
}))

const TabsBatchesPublishWithProviders = () => {
  return (
    <TestWrapper>
      <TabsBatchesPublish batch={BATCHES_API_RESPONSE_MOCK.batchs.find((batch) => batch.id === SELECTED_BATCH_ID) ?? null} />
    </TestWrapper>
  )
}

// TODO: fix due to batch details changes
describe.skip('TabsBatchesPublish', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterEach(() => {
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('renders without crashing', () => {
    render(<TabsBatchesPublishWithProviders />)
  })

  it('renders tabs and their content correctly', async () => {
    render(<TabsBatchesPublishWithProviders />)

    await waitFor(() => {
      expect(screen.getByText('Ready to publish')).toBeInTheDocument()
      expect(screen.getByText('Published')).toBeInTheDocument()
    })

    expect(screen.getByText('Transaction ID')).toBeInTheDocument()
    expect(screen.getByText('Transaction date')).toBeInTheDocument()
    expect(screen.getByText('Transaction type')).toBeInTheDocument()
    expect(screen.getByText('Total amount LCY')).toBeInTheDocument()
    expect(screen.getByText('Number of items')).toBeInTheDocument()
  })

  it('changes tab on click', async () => {
    render(<TabsBatchesPublishWithProviders />)

    const publishedTab = screen.getByRole('tab', { name: /published/i })
    fireEvent.click(publishedTab)

    await waitFor(() => {
      expect(screen.getByText('Transaction ID')).toBeInTheDocument()
      expect(screen.getByText('Transaction date')).toBeInTheDocument()
      expect(screen.getByText('Transaction type')).toBeInTheDocument()
      expect(screen.getByText('Total amount LCY')).toBeInTheDocument()
      expect(screen.getByText('Number of items')).toBeInTheDocument()
    })
  })
})
