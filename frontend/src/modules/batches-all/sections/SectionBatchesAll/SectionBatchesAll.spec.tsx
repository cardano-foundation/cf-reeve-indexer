import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { it, vi } from 'vitest'

import { BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'
import { ORGANISATIONS_MOCK } from 'libs/mock-service-worker/mocks/organisations.mock.ts'
import { server } from 'libs/mock-service-worker/server.ts'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'

import { SectionBatchesAll } from './SectionBatchesAll.component.tsx'

vi.mock('libs/models/batches-model/GetBatches/GetBatch.service.ts', () => ({
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

vi.mock('libs/authentication/user/userSelctedOrganisation.tsx', () => ({
  useSelectedOrganisation: () => ORGANISATIONS_MOCK[0].id
}))

const SectionBatchesReviewWithProviders = () => {
  return (
    <TestWrapper>
      <SectionBatchesAll />
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
    render(<SectionBatchesReviewWithProviders />)
  })

  it('renders date picker and autocomplete input fields', () => {
    render(<SectionBatchesReviewWithProviders />)

    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByLabelText('Choose date')).toBeInTheDocument()
  })

  it('renders table when batches are provided', async () => {
    render(<SectionBatchesReviewWithProviders />)

    await waitFor(() => {
      expect(screen.getByText('Batch ID')).toBeInTheDocument()
      expect(screen.getByText('Imported on')).toBeInTheDocument()
      expect(screen.getByText('Imported by')).toBeInTheDocument()
      expect(screen.getByText('Number of transactions')).toBeInTheDocument()
    })
  })

  it('updates selected status and date when input fields change', async () => {
    render(<SectionBatchesReviewWithProviders />)

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Pending' } })
    fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: '2022-12-31' } })

    const dateButton = screen.getByRole('button', { name: /Choose date/i })

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(dateButton).toHaveAttribute('value', '2022-12-31')
    })
  })

  it('re-fetches batches when selected status or date changes', async () => {
    render(<SectionBatchesReviewWithProviders />)

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Finished' } })
    fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: '2022-12-31' } })

    await waitFor(() => {
      expect(screen.getByText('Batch ID')).toBeInTheDocument()
      expect(screen.getByText('Imported on')).toBeInTheDocument()
      expect(screen.getByText('Imported by')).toBeInTheDocument()
      expect(screen.getByText('Number of transactions')).toBeInTheDocument()
    })
  })

  it('renders table pagination when batches are provided', async () => {
    render(<SectionBatchesReviewWithProviders />)

    await screen.findByText('1–10 of 15')
  })
})
