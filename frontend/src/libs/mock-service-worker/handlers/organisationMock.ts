import { http, HttpResponse } from 'msw'

const API_BASE_URL_MOCK = import.meta.env.VITE_API_URL

export const ORGANISATION_API_RESPONSE_MOCK = [
  {
    id: '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94',
    name: 'Cardano Foundation',
    description: 'Description',
    currencyId: 'Currency Id',
    accountPeriodFrom: '2021-02-05',
    accountPeriodTo: '2024-02-05'
  }
]

export const organisationMock = http.get(`${API_BASE_URL_MOCK}/api/v1/organisations/:id`, ({ params }) => {
  if (params.id?.includes('75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94')) {
    return HttpResponse.json(ORGANISATION_API_RESPONSE_MOCK[0])
  }

  return HttpResponse.json(ORGANISATION_API_RESPONSE_MOCK)
})
