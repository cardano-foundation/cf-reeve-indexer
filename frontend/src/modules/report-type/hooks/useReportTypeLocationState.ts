import { useParams } from 'react-router-dom'

import { useLocationState } from 'hooks'
import { ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types.ts'

export enum ReportTypeParam {
  BALANCE_SHEET = 'balance-sheet',
  INCOME_STATEMENT = 'income-statement'
}

interface Currency {
  name: string
  value: string
}

interface ReportTypeLocationState {
  currency: Currency
  period: string
  redirect?: string
  isAutomaticGeneration?: boolean
}

type ReportTypeParams = {
  reportType: ReportTypeParam
}

export const useReportTypeLocationState = () => {
  const { state } = useLocationState<ReportTypeLocationState>()
  const { reportType } = useParams<ReportTypeParams>()

  const { currency, period, redirect, isAutomaticGeneration } = state ?? {}

  const type = reportType?.toUpperCase().replace(/-/g, '_') as ReportType | undefined

  return {
    currency,
    period,
    reportType: type,
    redirect,
    isAutomaticGeneration
  }
}
