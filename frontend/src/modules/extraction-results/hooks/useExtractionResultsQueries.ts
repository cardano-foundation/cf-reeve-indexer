import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetExtractedTransactionsModel } from 'libs/models/extraction-model/GetExtractedTransactions/GetExtractedTransactionsModel.service.ts'
import { useGetOrganisationChartTypesModel } from 'libs/models/organisation-model/GetOrganisationChartTypes/GetOrganisationChartTypesModel.service.ts'
import { toDayjs } from 'libs/utils/toDayjs'
import { ExtractionFormValues } from 'modules/extraction/components/ExtractionForm/ExtractionForm.types.ts'

interface ExtractionResultsQueriesState {
  locationState: ExtractionFormValues | null
}

export const useExtractionResultsQueries = (state: ExtractionResultsQueriesState) => {
  const { locationState } = state
  const selectedOrganisation = useSelectedOrganisation()

  const { accountCode, accountSubtype, accountType, costCenter, dateFrom, dateTo, project } = locationState ?? {}

  const { organisationChartTypes } = useGetOrganisationChartTypesModel({ id: selectedOrganisation })

  const DEFAULT_REQUEST_PAYLOAD = {
    organisationId: selectedOrganisation,
    dateFrom: undefined,
    dateTo: undefined,
    accountType: undefined,
    accountSubType: undefined,
    accountCode: undefined,
    costCenter: undefined,
    project: undefined
  }

  const request = locationState
    ? {
        organisationId: selectedOrganisation,
        dateFrom: dateFrom ? toDayjs(dateFrom)?.format('YYYY-MM-DD') : undefined,
        dateTo: dateTo ? toDayjs(dateTo)?.format('YYYY-MM-DD') : undefined,
        accountType: accountType?.length
          ? accountType?.map((name) => organisationChartTypes?.find((type) => type.name === name)?.id.toString()).filter((item) => item !== undefined)
          : undefined,
        accountSubType: accountSubtype?.length
          ? accountSubtype
              ?.map((name) => {
                const subtypes = organisationChartTypes?.flatMap(({ subType }) => subType)

                return subtypes?.find((subtype) => subtype.name === name)?.id.toString()
              })
              .filter((item) => item !== undefined)
          : undefined,
        accountCode: accountCode?.length ? accountCode : undefined,
        costCenter: costCenter?.length ? costCenter : undefined,
        project: project?.length ? project : undefined
      }
    : DEFAULT_REQUEST_PAYLOAD

  const { transactions, isTransactionsFetching } = useGetExtractedTransactionsModel(request)

  const isFetching = isTransactionsFetching

  return {
    transactions: transactions ?? [],
    isFetching
  }
}
