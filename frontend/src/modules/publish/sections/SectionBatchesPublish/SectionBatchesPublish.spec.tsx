import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { it, vi } from 'vitest'

import { BATCHES_API_RESPONSE_MOCK } from 'libs/mock-service-worker/mocks/batches.mock.ts'
import { ORGANISATIONS_MOCK } from 'libs/mock-service-worker/mocks/organisations.mock.ts'
import { server } from 'libs/mock-service-worker/server.ts'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { SectionBatchesPublish } from 'modules/publish/sections/SectionBatchesPublish/SectionBatchesPublish.component.tsx'

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

const SectionBatchesPublishWithProviders = () => {
  return (
    <TestWrapper>
      <SectionBatchesPublish />
    </TestWrapper>
  )
}

describe('SectionBatchesPublish', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterEach(() => {
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('renders without crashing', () => {
    render(<SectionBatchesPublishWithProviders />)
  })

  it('renders date picker field', () => {
    render(<SectionBatchesPublishWithProviders />)

    expect(screen.getByLabelText('Choose date')).toBeInTheDocument()
  })

  it('renders table when batches are provided', async () => {
    render(<SectionBatchesPublishWithProviders />)

    await waitFor(() => {
      expect(screen.getByText('Batch ID')).toBeInTheDocument()
      expect(screen.getByText('Imported on')).toBeInTheDocument()
      expect(screen.getByText('Imported by')).toBeInTheDocument()
      expect(screen.getByText('Number of transactions')).toBeInTheDocument()
    })
  })

  it('updates selected date when input field change', async () => {
    render(<SectionBatchesPublishWithProviders />)

    fireEvent.change(screen.getByLabelText('Choose date'), { target: { value: '2022-12-31' } })

    const dateButton = screen.getByRole('button', { name: /Choose date/i })

    await waitFor(() => {
      expect(dateButton).toHaveAttribute('value', '2022-12-31')
    })
  })

  it('renders table pagination when batches are provided', async () => {
    render(<SectionBatchesPublishWithProviders />)

    await screen.findByText('1–10 of 15')
  })
})
