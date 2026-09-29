import { useFormik, useFormikContext } from 'formik'
import { noop } from 'lodash'

import { type AutocompleteOption } from 'features/mui/base'
import { useDatesRange } from 'hooks'
import { EventProjectEntity, GetEventTypesResponse200 } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { useGetEventProjectsModel } from 'libs/models/events-model/GetEventProjects/GetEventProjectsModel.service'
import { useGetEventTypesModel } from 'libs/models/events-model/GetEventTypes/GetEventTypesModel.service'

import { DEFAULT_SEARCH_FILTERS_VALUES } from './SearchFilters.consts'
import { SearchFiltersValues } from './SearchFilters.types'

export const getAllEventTypeOptions = (eventTypes: GetEventTypesResponse200 | null | undefined): AutocompleteOption[] => {
  return eventTypes
    ? [...eventTypes].sort((current, next) => current.localeCompare(next)).map((option) => ({ label: option, value: option }))
    : []
}

export const getAllEventProjectOptions = (projects: EventProjectEntity[] | null | undefined): AutocompleteOption[] => {
  return projects
    ? [...projects]
        .filter((option) => Boolean(option) && Object.keys(option).length > 0)
        .sort((current, next) => current.projectId.localeCompare(next.projectId))
        .map(({ projectId, projectTitle }) => ({ label: projectTitle || projectId, value: projectId }))
    : []
}

export const useSearchFiltersOptions = () => {
  const { selectedOrganisation } = useLayoutPublicContext()
  const isOrganisationSelected = Boolean(selectedOrganisation)

  const { eventTypes } = useGetEventTypesModel({ parameters: { organisationId: selectedOrganisation } }, isOrganisationSelected)
  const { projects } = useGetEventProjectsModel({ parameters: { organisationId: selectedOrganisation } }, isOrganisationSelected)

  const eventTypeOptions = getAllEventTypeOptions(eventTypes)
  const projectOptions = getAllEventProjectOptions(projects)

  return {
    eventTypeOptions,
    projectOptions
  }
}

export const useSearchDrawerFiltersForm = (lockedProjectId?: string | null) => {
  const filters = useFormik({
    initialValues: { ...DEFAULT_SEARCH_FILTERS_VALUES, project: lockedProjectId ? [lockedProjectId] : DEFAULT_SEARCH_FILTERS_VALUES.project },
    onSubmit: noop,
    enableReinitialize: true,
    validateOnChange: true
  })

  return { filters }
}

export const useSearchFilters = () => {
  const { values } = useFormikContext<SearchFiltersValues>()

  const { eventTypeOptions, projectOptions } = useSearchFiltersOptions()

  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate } = useDatesRange()

  return {
    values,
    dateFromMaxDate,
    dateFromMinDate,
    dateToMaxDate,
    dateToMinDate,
    options: {
      eventTypeOptions,
      projectOptions
    }
  }
}
