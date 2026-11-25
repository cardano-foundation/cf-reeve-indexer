import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { VERDICT_SUMMARY } from 'modules/public-document-detail/constants/detail.consts.ts'

import { VerdictSummary } from './VerdictSummary.component'

describe('VerdictSummary', () => {
  it('shows the verified headline and plain-language meaning', () => {
    render(<VerdictSummary verdict="VERIFIED" />)
    expect(screen.getByText(VERDICT_SUMMARY.VERIFIED.headline)).toBeInTheDocument()
    expect(screen.getByText(VERDICT_SUMMARY.VERIFIED.sentence)).toBeInTheDocument()
  })

  it('surfaces a content-hash mismatch as its own distinct message', () => {
    render(<VerdictSummary verdict="CONTENT_HASH_MISMATCH" />)
    expect(screen.getByText(VERDICT_SUMMARY.CONTENT_HASH_MISMATCH.headline)).toBeInTheDocument()
    expect(screen.getByText(VERDICT_SUMMARY.CONTENT_HASH_MISMATCH.sentence)).toBeInTheDocument()
  })
})
