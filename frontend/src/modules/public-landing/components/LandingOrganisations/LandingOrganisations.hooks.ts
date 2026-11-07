import { useFormik } from 'formik'
import { noop } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import { OrganisationEntity } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types.ts'
import { getGridColumns } from 'modules/public-landing/utils/grid.ts'
import { getMockOrganisationStats } from 'modules/public-landing/utils/mockLanding.ts'

import { DEFAULT_LANDING_ORGANISATIONS_FILTERS_VALUES } from './LandingOrganisations.consts'
import { LandingOrganisationsFiltersValues, OrganisationSort } from './LandingOrganisations.types'

const SORTERS = {
  [OrganisationSort.LAST_UPDATED]: (a: { lastUpdated: string }, b: { lastUpdated: string }) => b.lastUpdated.localeCompare(a.lastUpdated),
  [OrganisationSort.NAME]: (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)
}

export const useLandingOrganisationsFilters = () => {
  const filters = useFormik<LandingOrganisationsFiltersValues>({
    initialValues: DEFAULT_LANDING_ORGANISATIONS_FILTERS_VALUES,
    onSubmit: noop,
    enableReinitialize: true,
    validateOnChange: true
  })

  return { filters }
}

export const useLandingOrganisations = (organisations: OrganisationEntity[], { search, sort }: LandingOrganisationsFiltersValues, pageSize: number) => {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [search, sort, pageSize])

  const items = useMemo(() => organisations.map((organisation) => ({ ...organisation, ...getMockOrganisationStats(organisation.id) })), [organisations])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()

    return items.filter((item) => !query || item.name.toLowerCase().includes(query)).sort(SORTERS[sort])
  }, [items, search, sort])

  const columns = getGridColumns(filteredItems.length)
  const pageCount = Math.ceil(filteredItems.length / pageSize)
  const currentPage = Math.min(page, Math.max(pageCount, 1))
  const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return {
    items,
    filteredCount: filteredItems.length,
    columns,
    visibleItems,
    currentPage,
    pageCount,
    handlePageChange: setPage
  }
}
