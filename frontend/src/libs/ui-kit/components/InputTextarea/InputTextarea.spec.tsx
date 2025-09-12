import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { InputTextarea } from './InputTextarea.component'

describe('InputTextarea', () => {
  it('passes dataTestId prop to data-testid attribute', () => {
    render(<InputTextarea dataTestId="test-id" />)
    const textarea = screen.getByTestId('test-id')

    expect(textarea).toBeInTheDocument()
  })

  it('spreads other props onto the TextField component', () => {
    render(<InputTextarea disabled={true} />)
    const textarea = screen.getByRole('textbox')

    expect(textarea).toBeDisabled()
  })
})
