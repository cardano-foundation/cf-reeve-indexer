const LEGAL_FORM_WORDS = new Set(['ag', 'gmbh', 'sa', 'sarl', 'ltd', 'limited', 'inc', 'llc', 'plc', 'bv', 'nv', 'stiftung'])

const getNameWords = (name: string) =>
  name
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word && !LEGAL_FORM_WORDS.has(word))

export const isSameOrganisationName = (organisationName: string | null | undefined, attestedName: string | null | undefined) => {
  if (!organisationName || !attestedName) return false

  const organisationWords = getNameWords(organisationName)

  return organisationWords.length > 0 && organisationWords.join(' ') === getNameWords(attestedName).join(' ')
}
