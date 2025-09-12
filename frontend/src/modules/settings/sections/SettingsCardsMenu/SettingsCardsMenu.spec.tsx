import { render, screen } from '@testing-library/react'

import * as permissions from 'libs/permissions/has-permission'
import { TestWrapper } from 'libs/vitest/components/TestWrapper.component.tsx'
import { SettingsCardsMenu } from 'modules/settings/sections/SettingsCardsMenu/SettingsCardsMenu.component.tsx'

const SettingsCardsMenuWithProviders = () => {
  return (
    <TestWrapper>
      <SettingsCardsMenu />
    </TestWrapper>
  )
}

describe('SettingsCardsMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('renders all the cards when permissions are granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(true)

    render(<SettingsCardsMenuWithProviders />)

    expect(screen.getByRole('heading', { name: 'Organization' })).toBeInTheDocument()
    expect(screen.getByText('Manage organization data')).toBeInTheDocument()
  })
  it('renders no cards when permissions are not granted', async () => {
    vi.spyOn(permissions, 'hasPermission').mockReturnValue(false)

    render(<SettingsCardsMenuWithProviders />)

    expect(screen.queryByRole('heading', { name: 'Organization' })).not.toBeInTheDocument()
    expect(screen.queryByText('Manage organization data')).not.toBeInTheDocument()
  })
})
