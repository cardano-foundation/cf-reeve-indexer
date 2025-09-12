import { render, screen, waitFor } from '@testing-library/react'
import { it, vi } from 'vitest'

import { BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'
import { ORGANISATIONS_MOCK } from 'libs/mock-service-worker/mocks/organisations.mock'
import { server } from 'libs/mock-service-worker/server.ts'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { SectionBatches } from 'modules/transactions/sections/SectionBatches/SectionBatches.component.tsx'

vi.mock('libs/models/batches-model/GetBatches/GetBatch.service.ts', () => ({
  useGetBatchesModel: () => ({
    batches: BATCHES_API_RESPONSE_MOCK,
    refetch: () => {}
  })
}))

vi.mock('libs/authentication/user/userSelctedOrganisation.tsx', () => ({
  useSelectedOrganisation: () => ORGANISATIONS_MOCK[0].id
}))

const SectionBatchesWithProviders = () => {
  return (
    <TestWrapper>
      <SectionBatches />
    </TestWrapper>
  )
}

describe('SectionBatchesAll', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterEach(() => {
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('renders without crashing', () => {
    render(<SectionBatchesWithProviders />)
  })

  it('renders section title', async () => {
    render(<SectionBatchesWithProviders />)

    await screen.findByText('Recently imported')
  })

  it('renders section description', async () => {
    render(<SectionBatchesWithProviders />)

    await screen.findByText('Check latest batches requiring action')
  })

  it('renders table "All batches" link button', async () => {
    render(<SectionBatchesWithProviders />)

    await screen.findByLabelText('All batches')
  })

  it('renders table when batches are provided', async () => {
    render(<SectionBatchesWithProviders />)

    await waitFor(() => {
      expect(screen.getByText('Batch ID')).toBeInTheDocument()
      expect(screen.getByText('Imported on')).toBeInTheDocument()
      expect(screen.getByText('Imported by')).toBeInTheDocument()
      expect(screen.getByText('Number of transactions')).toBeInTheDocument()
    })
  })
})
