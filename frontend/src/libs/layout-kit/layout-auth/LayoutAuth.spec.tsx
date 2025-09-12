import { act, fireEvent, render, screen } from '@testing-library/react'
import { Mock, vi } from 'vitest'

import { UserRole } from 'libs/authentication/types/user.types'
import { getUser } from 'libs/authentication/user/getUser'
import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'

vi.mock('libs/authentication/user/getUser', () => ({
  getUser: vi.fn()
}))

const mockGetUser = (roles: UserRole[]) =>
  getUserMock.mockReturnValue({
    roles,
    organisation_id: []
  })
const getUserMock = getUser as Mock

const LayoutAuthWithProviders = () => {
  return (
    <TestWrapper>
      <LayoutAuth />
    </TestWrapper>
  )
}

describe('LayoutAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('{"token":"test-token"}')
  })

  it('renders all main links by default', async () => {
    mockGetUser([UserRole.ADMIN])

    render(<LayoutAuthWithProviders />)

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Transactions' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Data explorer' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reporting' })).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('does not render sub links of "Transactions" by default', async () => {
    mockGetUser([UserRole.ADMIN])

    render(<LayoutAuthWithProviders />)

    expect(screen.queryByRole('link', { name: 'Import' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Review' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Publish' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Reconciliation' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'All batches' })).not.toBeInTheDocument()
  })

  it('does not render sub links of "Data explorer" by default', async () => {
    mockGetUser([UserRole.ADMIN])

    render(<LayoutAuthWithProviders />)

    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Extraction' })).not.toBeInTheDocument()
  })

  it('does not render sub links of "Reporting" by default', async () => {
    mockGetUser([UserRole.ADMIN])

    render(<LayoutAuthWithProviders />)

    expect(screen.queryByRole('link', { name: 'Report' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Publish' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'All reports' })).not.toBeInTheDocument()
  })

  it('does not render sub links of "Settings" by default', async () => {
    mockGetUser([UserRole.ADMIN])

    render(<LayoutAuthWithProviders />)

    expect(screen.queryByRole('link', { name: 'Organization' })).not.toBeInTheDocument()
    // expect(screen.queryByRole('link', { name: 'User management' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Chart of accounts' })).not.toBeInTheDocument()
    // expect(screen.queryByRole('link', { name: 'Cost centers' })).not.toBeInTheDocument()
    // expect(screen.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument()
    // expect(screen.queryByRole('link', { name: 'VAT codes' })).not.toBeInTheDocument()
    // expect(screen.queryByRole('link', { name: 'Currencies' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Event codes' })).not.toBeInTheDocument()
  })

  it('renders sub links of "Transactions" when "Transactions" is clicked', async () => {
    mockGetUser([UserRole.ADMIN])

    render(<LayoutAuthWithProviders />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sidebar toggle' }))
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'Transactions' }))
    })

    expect(screen.getByRole('link', { name: 'Import' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Publish' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'All batches' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reconciliation' })).toBeInTheDocument()
  })

  it('renders sub links of "Data explorer" when "Data explorer" is clicked', async () => {
    mockGetUser([UserRole.ADMIN])

    render(<LayoutAuthWithProviders />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sidebar toggle' }))
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'Data explorer' }))
    })

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Extraction' })).toBeInTheDocument()
  })

  it('renders sub links of "Reporting" when "Reporting" is clicked', async () => {
    mockGetUser([UserRole.MANAGER])

    render(<LayoutAuthWithProviders />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sidebar toggle' }))
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'Reporting' }))
    })

    expect(screen.getByRole('link', { name: 'Report' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Publish' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'All reports' })).toBeInTheDocument()
  })

  it('renders admin user sub links of "Settings" when "Settings" is clicked', async () => {
    mockGetUser([UserRole.ADMIN])

    render(<LayoutAuthWithProviders />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sidebar toggle' }))
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Settings'))
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'Organization' }))
    })

    expect(screen.getByRole('link', { name: 'Organization' })).toBeInTheDocument()
    // expect(screen.getByRole('link', { name: 'User management' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Chart of accounts' })).toBeInTheDocument()
    // expect(screen.getByRole('link', { name: 'Cost centers' })).toBeInTheDocument()
    // expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    // expect(screen.getByRole('link', { name: 'VAT codes' })).toBeInTheDocument()
    // expect(screen.getByRole('link', { name: 'Currencies' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Event codes' })).toBeInTheDocument()
  })

  it('renders manager user sub links of "Settings" when "Settings" is clicked', async () => {
    mockGetUser([UserRole.MANAGER])

    render(<LayoutAuthWithProviders />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sidebar toggle' }))
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Settings'))
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'Organization' }))
    })

    expect(screen.getByRole('link', { name: 'Organization' })).toBeInTheDocument()
    // expect(screen.queryByRole('link', { name: 'User management' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Chart of accounts' })).toBeInTheDocument()
    // expect(screen.getByRole('link', { name: 'Cost centers' })).toBeInTheDocument()
    // expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    // expect(screen.getByRole('link', { name: 'VAT codes' })).toBeInTheDocument()
    // expect(screen.getByRole('link', { name: 'Currencies' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Event codes' })).toBeInTheDocument()
  })

  it('does not render "Settings" for auditor user', async () => {
    mockGetUser([UserRole.AUDITOR])

    render(<LayoutAuthWithProviders />)

    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('renders sub links of current active section', async () => {
    mockGetUser([UserRole.ADMIN])

    render(<LayoutAuthWithProviders />)

    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'Data explorer' }))
    })

    expect(screen.queryByRole('link', { name: 'Import' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Review' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Publish' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'All batches' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Reconciliation' })).not.toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Extraction' })).toBeInTheDocument()
  })

  it('renders no sub links if no section is active', async () => {
    mockGetUser([UserRole.ADMIN])

    render(<LayoutAuthWithProviders />)

    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: 'Home' }))
    })

    expect(screen.queryByRole('link', { name: 'Import' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Review' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Publish' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'All batches' })).not.toBeInTheDocument()
  })
})
