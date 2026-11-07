export interface LandingPartner {
  name: string
  domain: string
}

export interface LandingOrganisationStats {
  lastUpdated: string
}

export const mockPartners: LandingPartner[] = [
  { name: 'Example Partner 1', domain: 'example.org' },
  { name: 'Example Partner 2', domain: 'example.org' },
  { name: 'Example Partner 3', domain: 'example.org' }
]

export const getMockOrganisationStats = (organisationId: string): LandingOrganisationStats => {
  const seed = [...organisationId].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const day = String((seed % 28) + 1).padStart(2, '0')

  return { lastUpdated: `2026-10-${day}` }
}
