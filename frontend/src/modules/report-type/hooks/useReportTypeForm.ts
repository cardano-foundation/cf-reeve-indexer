import { FormikErrors, FormikValues } from 'formik'
import { Dispatch, SetStateAction } from 'react'

import { ReportApiResponse, ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ReportBalanceSheetFormValues, ReportIncomeStatementFormValues } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.types.ts'
import { useReportValidate } from 'modules/report-type/hooks/useReportValidate.ts'
import { getTotalAssets, getTotalLiabilities } from 'modules/report-type/utils/calculations.ts'
import { getBalanceSheetInitialValues, getIncomeStatementInitialValues } from 'modules/report-type/utils/form.ts'
import { validateAgainstGenereatedReport } from 'modules/report-type/utils/validations.ts'

export interface BalanceSheetFormErrorValues extends ReportBalanceSheetFormValues {
  balance?: string
  crossReportProfit?: string
}

export interface IncomeStatementFormErrorValues extends ReportIncomeStatementFormValues {
  crossReportProfit?: string
}

interface ReportTypeFormState {
  generatedReportOfCurrentType: ReportApiResponse
  reportOfCurrentType?: ReportApiResponse
  reportType?: ReportType
  isAutomaticGeneration?: boolean
}

interface ReportTypeFormHandlers {
  onDialogReportPublishedNewSaveOpen: () => void
  onDialogReportEditSaveOpen: () => void
  onDialogReportNewSaveOpen: () => void
  onSaveReport: Dispatch<SetStateAction<ReportBalanceSheetFormValues | ReportIncomeStatementFormValues | null>>
}

export const useReportTypeForm = (state: ReportTypeFormState, handlers: ReportTypeFormHandlers) => {
  const { generatedReportOfCurrentType, reportOfCurrentType, reportType, isAutomaticGeneration } = state
  const { onDialogReportPublishedNewSaveOpen, onDialogReportEditSaveOpen, onDialogReportNewSaveOpen, onSaveReport } = handlers

  const { t } = useTranslations()

  const { warnings, handleResetWarnings, handleWarnings, hasAnyWarnings } = useReportValidate({ reportType })

  const valuesAutomaticGeneration: ReportBalanceSheetFormValues | ReportIncomeStatementFormValues | undefined = generatedReportOfCurrentType
    ? generatedReportOfCurrentType.type === ReportType.BALANCE_SHEET
      ? getBalanceSheetInitialValues(generatedReportOfCurrentType)
      : generatedReportOfCurrentType.type === ReportType.INCOME_STATEMENT
        ? getIncomeStatementInitialValues(generatedReportOfCurrentType)
        : undefined
    : undefined

  const valuesManualInput: ReportBalanceSheetFormValues | ReportIncomeStatementFormValues | undefined = reportOfCurrentType
    ? !reportOfCurrentType.publish
      ? reportOfCurrentType.type === ReportType.BALANCE_SHEET
        ? getBalanceSheetInitialValues(reportOfCurrentType)
        : reportOfCurrentType.type === ReportType.INCOME_STATEMENT
          ? getIncomeStatementInitialValues(reportOfCurrentType)
          : undefined
      : undefined
    : undefined

  const values = isAutomaticGeneration ? valuesAutomaticGeneration : valuesManualInput

  const handleFormValidate = (values: FormikValues) => {
    if (reportType === ReportType.BALANCE_SHEET) {
      const errors = {} as FormikErrors<BalanceSheetFormErrorValues>

      const totalAssets = getTotalAssets(values)
      const totalLiabilities = getTotalLiabilities(values)

      const isAssetsAndLiabilitiesBalanced = totalAssets.toFixed(2) === totalLiabilities.toFixed(2)

      if (!isAssetsAndLiabilitiesBalanced) {
        errors.balance = t({ id: 'invalidReportDataErrorMessage' })
      }

      return errors
    }

    return {}
  }

  const handleFormSubmit = (values: ReportBalanceSheetFormValues | ReportIncomeStatementFormValues) => {
    onSaveReport(values)

    if (reportOfCurrentType) {
      reportOfCurrentType.publish ? onDialogReportPublishedNewSaveOpen() : onDialogReportEditSaveOpen()
    } else {
      onDialogReportNewSaveOpen()
    }

    validateAgainstGenereatedReport(generatedReportOfCurrentType, values, handleWarnings)
  }

  return {
    warnings,
    values,
    handleFormSubmit,
    handleFormValidate,
    handleResetWarnings,
    hasAnyWarnings
  }
}
