import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'

const LayoutPublicWithProviders = () => {
  return (
    <TestWrapper>
      <LayoutPublic />
    </TestWrapper>
  )
}

describe('LayoutPublic', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders organisations select field', async () => {
    render(<LayoutPublicWithProviders />)

    expect(screen.getByTestId('field-organisations')).toBeInTheDocument()
  })

  it('renders all main links by default', async () => {
    render(<LayoutPublicWithProviders />)

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reports' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Transactions' })).toBeInTheDocument()
  })

  it('renders logo icon', async () => {
    render(<LayoutPublicWithProviders />)

    expect(screen.getByText('Powered by')).toBeInTheDocument()
    expect(screen.getByTestId('product-logo')).toBeInTheDocument()
  })
})
