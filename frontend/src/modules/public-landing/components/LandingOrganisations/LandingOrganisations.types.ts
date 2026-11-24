export enum OrganisationSort {
  LAST_UPDATED = 'lastUpdated',
  NAME = 'name'
}

export interface LandingOrganisationsFiltersValues {
  search: string
  sort: OrganisationSort
}
