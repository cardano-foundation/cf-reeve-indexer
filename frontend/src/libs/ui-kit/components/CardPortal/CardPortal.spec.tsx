import { render, screen } from '@testing-library/react'
import { Component } from 'iconsax-react'

import { CardPortal } from 'libs/ui-kit/components/CardPortal/CardPortal.component.tsx'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'

const CardPortalWithProviders = () => {
  return (
    <TestWrapper>
      <CardPortal background="white" description="Test description" icon={Component} title="Test title" to="/test-url" />
    </TestWrapper>
  )
}

describe('CardPortal', () => {
  it('renders card', async () => {
    render(<CardPortalWithProviders />)

    const link = screen.getByRole('link')

    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test-url')
    expect(screen.getByRole('heading', { name: 'Test title' })).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})
