import { render, screen } from '@testing-library/react'
import { it, vi } from 'vitest'

import { TransactionType } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types'
import { BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'
import { ORGANISATIONS_MOCK } from 'libs/mock-service-worker/mocks/organisations.mock.ts'
import { server } from 'libs/mock-service-worker/server.ts'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { TransactionsPublish } from 'modules/publish/components/TransactionsPublish/TransactionsPublish.component.tsx'

vi.mock('modules/publish/components/BatchPublishContext/hooks/useBatchPublishContext.tsx', () => ({
  useBatchPublishContext: () => {
    const selectedBatchId = '15'
    return { selectedBatchId, setSelectedBatchId: vi.fn() }
  }
}))

vi.mock('libs/models/batches-model/GetBatch/GetBatch.service.ts', () => ({
  useGetBatchModel: () => ({
    batch: BATCHES_API_RESPONSE_MOCK.batchs[0],
    refetch: () => {}
  })
}))

vi.mock('libs/models/organisation-model/GetOrganisations/GetOrganisations.service.ts', () => ({
  useGetOrganisationsModel: () => ({
    organisations: ORGANISATIONS_MOCK,
    isFetching: false
  })
}))

const TransactionsPublishWithProviders = () => {
  return (
    <TestWrapper>
      <TransactionsPublish />
    </TestWrapper>
  )
}

// TODO: fix due to batch details changes
describe.skip('TransactionsPublish', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterEach(() => {
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('renders without crashing', () => {
    render(<TransactionsPublishWithProviders />)
  })

  it('renders transaction data correctly', async () => {
    render(<TransactionsPublishWithProviders />)

    expect(await screen.findByText('TXN004')).toBeInTheDocument()
    expect(screen.getByText(TransactionType.CUSTOMER_PAYMENT)).toBeInTheDocument()
    expect(screen.getByText('300.00')).toBeInTheDocument()
  })
})
