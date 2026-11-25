import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ButtonBack } from './ButtonBack.component'

describe('ButtonBack', () => {
  it('renders a router link to the given destination', () => {
    render(
      <MemoryRouter>
        <ButtonBack aria-label="Back to documents" to="/documents/org-1" />
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: 'Back to documents' })
    expect(link.getAttribute('href')).toBe('/documents/org-1')
  })

  it('renders a plain button when no destination is given', () => {
    render(
      <MemoryRouter>
        <ButtonBack aria-label="Back" />
      </MemoryRouter>
    )

    screen.getByRole('button', { name: 'Back' })
    expect(screen.queryByRole('link')).toBeNull()
  })
})
