import type { KeyCard } from './cards'

/**
 * What the operator can actually say about a holder. Cards issued here are ALWAYS EXTERNAL and their
 * subjectId is always machine-minted, so neither is part of the input — see `useIssueCardForm`. Every
 * field is optional: an org-less, unnamed card is valid for an unaffiliated holder who only decrypts
 * published documents.
 */
export type IssueSubject = {
  displayName?: string
  email?: string
  organisationId?: string
}

export const downloadCardFile = (card: KeyCard, fileName: string): void => {
  const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
