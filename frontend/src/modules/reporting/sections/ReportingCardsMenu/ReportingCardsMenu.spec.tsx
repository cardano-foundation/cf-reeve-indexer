import { render, screen } from '@testing-library/react'

import * as permissions from 'libs/permissions/has-permission'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { ReportingCardsMenu } from 'modules/reporting/sections/ReportingCardsMenu/ReportingCardsMenu.component.tsx'

const ReportingCardsMenuWithProviders = () => {
  return (
    <TestWrapper>
      <ReportingCardsMenu />
    </TestWrapper>
  )
}

describe('ReportingCardsMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('renders all the cards when permissions are granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(true)

    render(<ReportingCardsMenuWithProviders />)

    expect(screen.getByRole('heading', { name: 'Report' })).toBeInTheDocument()
    expect(screen.getByText('Create financial reports')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Publish' })).toBeInTheDocument()
    expect(screen.getByText('Submit financial reports to the blockchain')).toBeInTheDocument()
  })
  it('renders no cards when permissions are not granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(false)

    render(<ReportingCardsMenuWithProviders />)

    expect(screen.queryByRole('heading', { name: 'Report' })).not.toBeInTheDocument()
    expect(screen.queryByText('Create financial reports')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Publish' })).not.toBeInTheDocument()
    expect(screen.queryByText('Submit financial reports to the blockchain')).not.toBeInTheDocument()
  })
})
