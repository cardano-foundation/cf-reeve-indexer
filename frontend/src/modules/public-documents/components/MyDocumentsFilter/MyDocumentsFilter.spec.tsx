import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MyDocumentsFilter } from './MyDocumentsFilter.component'

const ALICE_PUB = '8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a'
const ALICE_HASH = '300c9c9603b92a4b39ed3958bf9240114804db4fd373012c0ca47432d63425ae'

/** Open the panel and switch to the paste-key tab. */
const openPasteTab = () => {
  fireEvent.click(screen.getByRole('button', { name: /filter for my documents/i }))
  fireEvent.click(screen.getByRole('button', { name: /paste public key/i }))
}

describe('MyDocumentsFilter', () => {
  it('hashes a pasted public key and reports the hash upward', async () => {
    const onChange = vi.fn()
    render(<MyDocumentsFilter recipientKeyHash={null} onRecipientKeyHashChange={onChange} />)

    openPasteTab()
    fireEvent.change(screen.getByLabelText(/x25519 public key/i), { target: { value: ALICE_PUB } })
    fireEvent.click(screen.getByRole('button', { name: /^apply$/i }))

    // The component must emit the HASH, never the key itself.
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(ALICE_HASH))
  })

  it('trims surrounding whitespace before hashing', async () => {
    const onChange = vi.fn()
    render(<MyDocumentsFilter recipientKeyHash={null} onRecipientKeyHashChange={onChange} />)

    openPasteTab()
    fireEvent.change(screen.getByLabelText(/x25519 public key/i), { target: { value: `  ${ALICE_PUB}\n` } })
    fireEvent.click(screen.getByRole('button', { name: /^apply$/i }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(ALICE_HASH))
  })

  it('rejects a malformed key without calling back', async () => {
    const onChange = vi.fn()
    render(<MyDocumentsFilter recipientKeyHash={null} onRecipientKeyHashChange={onChange} />)

    openPasteTab()
    fireEvent.change(screen.getByLabelText(/x25519 public key/i), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: /^apply$/i }))

    await screen.findByText(/64 hexadecimal characters/i)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows the active filter and can clear it', () => {
    const onChange = vi.fn()
    render(<MyDocumentsFilter recipientKeyHash={ALICE_HASH} onRecipientKeyHashChange={onChange} />)

    expect(screen.getByText(/showing documents addressed to/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /clear filter/i }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('does not offer the key input until the filter button is pressed', () => {
    render(<MyDocumentsFilter recipientKeyHash={null} onRecipientKeyHashChange={vi.fn()} />)

    expect(screen.queryByLabelText(/x25519 public key/i)).not.toBeInTheDocument()
  })
})
