import { LandingOrganisationsFiltersValues, OrganisationSort } from './LandingOrganisations.types'

export const ORGANISATIONS_PAGE_SIZE = {
  DESKTOP: 6,
  MOBILE: 4
}

export const DEFAULT_LANDING_ORGANISATIONS_FILTERS_VALUES: LandingOrganisationsFiltersValues = {
  search: '',
  sort: OrganisationSort.LAST_UPDATED
}
