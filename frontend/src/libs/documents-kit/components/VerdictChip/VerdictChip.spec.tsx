import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { VerdictChip } from './VerdictChip.component'

describe('VerdictChip', () => {
  it('renders VERIFIED as success', () => {
    render(<VerdictChip verdict="VERIFIED" />)
    expect(screen.getByText('VERIFIED')).toBeInTheDocument()
  })

  it('renders IPFS_UNAVAILABLE as a warning, never as a plain document state', () => {
    render(<VerdictChip verdict="IPFS_UNAVAILABLE" />)
    const chip = screen.getByText('IPFS_UNAVAILABLE')
    expect(chip.closest('.MuiChip-colorWarning')).not.toBeNull()
  })

  it('renders hash mismatches and malformed states as errors', () => {
    render(<VerdictChip verdict="CONTENT_HASH_MISMATCH" />)
    expect(screen.getByText('CONTENT_HASH_MISMATCH').closest('.MuiChip-colorError')).not.toBeNull()
  })
})
