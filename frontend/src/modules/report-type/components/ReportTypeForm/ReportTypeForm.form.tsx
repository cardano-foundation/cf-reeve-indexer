import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikConfig, FormikErrors, FormikProps } from 'formik'
import { Forbidden2 } from 'iconsax-react'
import { noop } from 'lodash'

import {
  ReportApiResponse,
  ReportBalanceSheetApiResponse,
  ReportIncomeStatementApiResponse,
  ReportType
} from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { AlertView } from 'modules/report-type/components/AlertView/AlertView.component.tsx'
import { AssetsGroup } from 'modules/report-type/components/AssetsGroup/AssetsGroup.component.tsx'
import { IncomeGroup } from 'modules/report-type/components/IncomeGroup/IncomeGroup.component.tsx'
import { LiabilitiesAndFoundationCapitalGroup } from 'modules/report-type/components/LiabilitiesAndFoundationCapitalGroup/LiabilitiesAndFoundationCapitalGroup.component.tsx'
import { ReportBalanceSheetFormValues, ReportIncomeStatementFormValues } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.types.ts'
import { BalanceSheetFormErrorValues, IncomeStatementFormErrorValues } from 'modules/report-type/hooks/useReportTypeForm.ts'
import { BalanceSheetWarnings, IncomeStatementWarnings } from 'modules/report-type/hooks/useReportValidate.ts'
import { validateCrossReportProfit } from 'modules/report-type/utils/validations.ts'

const initialBalanceSheetValues: ReportBalanceSheetFormValues = {
  cashAndCashEquivalents: formatNumber(0),
  cryptoAssets: formatNumber(0),
  otherReceivables: formatNumber(0),
  prepaymentsAndOtherShortTermAssets: formatNumber(0),
  financialAssets: formatNumber(0),
  investments: formatNumber(0),
  tangibleAssets: formatNumber(0),
  intangibleAssets: formatNumber(0),
  tradeAccountsPayables: formatNumber(0),
  otherShortTermLiabilities: formatNumber(0),
  accrualsAndShortTermProvisions: formatNumber(0),
  provisions: formatNumber(0),
  capital: formatNumber(0),
  resultsCarriedForward: formatNumber(0),
  profitForTheYear: formatNumber(0)
}

const initialIncomeStatementValues: ReportIncomeStatementFormValues = {
  otherIncome: formatNumber(0),
  buildOfLongTermProvision: formatNumber(0),
  externalServices: formatNumber(0),
  personnelExpenses: formatNumber(0),
  rentExpenses: formatNumber(0),
  generalAndAdministrativeExpenses: formatNumber(0),
  depreciationAndImpairmentLossesOnTangibleAssets: formatNumber(0),
  amortizationOnIntangibleAssets: formatNumber(0),
  financialRevenues: formatNumber(0),
  realisedGainsOnSaleOfCryptocurrencies: formatNumber(0),
  stakingRewardsIncome: formatNumber(0),
  netIncomeOptionsSale: formatNumber(0),
  financialExpenses: formatNumber(0),
  extraordinaryExpenses: formatNumber(0),
  directTaxes: formatNumber(0)
}

const initialState = {
  [ReportType.BALANCE_SHEET]: initialBalanceSheetValues,
  [ReportType.INCOME_STATEMENT]: initialIncomeStatementValues
} as const

type ReportBalanceSheetFormLayoutProps = FormikProps<ReportBalanceSheetFormValues> & {
  errors: FormikErrors<BalanceSheetFormErrorValues>
  reportOfCurrentType?: ReportBalanceSheetApiResponse | ReportIncomeStatementApiResponse
  reportOfOppositeType: ReportBalanceSheetApiResponse | ReportIncomeStatementApiResponse
  warnings?: BalanceSheetWarnings
  onResetWarnings?: () => void
  onViewOpen?: (report: ReportApiResponse) => void
  isPresentationMode?: boolean
  isSaveDisabled: boolean
}

const ReportBalanceSheetFormLayout = ({
  dirty,
  errors,
  initialValues,
  reportOfCurrentType,
  reportOfOppositeType,
  warnings,
  values,
  resetForm,
  onResetWarnings,
  onViewOpen,
  validateForm,
  isPresentationMode = false,
  isSaveDisabled
}: ReportBalanceSheetFormLayoutProps) => {
  const { t } = useTranslations()

  const { balance } = errors ?? {}

  const isCrossReportProfitEqual = validateCrossReportProfit(reportOfOppositeType, values)

  const handleFormReset = () => {
    resetForm()
    onResetWarnings?.()
    validateForm(initialValues)
  }

  return (
    <Form>
      {!isPresentationMode && reportOfCurrentType && (
        <Box mb={6}>
          <AlertView
            message={reportOfCurrentType.publish ? t({ id: 'alertPublishedReportMessage' }) : t({ id: 'alertEditReportMessage' })}
            report={reportOfCurrentType}
            severity="warning"
            onViewOpen={onViewOpen}
          />
        </Box>
      )}
      <AssetsGroup errors={errors} warnings={warnings} values={values} isPresentationMode={isPresentationMode} />
      <LiabilitiesAndFoundationCapitalGroup
        errors={errors}
        warnings={warnings}
        values={values}
        isCrossReportProfitEqual={isCrossReportProfitEqual}
        isPresentationMode={isPresentationMode}
      />
      {!isPresentationMode && (
        <>
          <Divider />
          {(balance || isCrossReportProfitEqual) && (
            <Box display="flex" flexDirection="column" gap={3} mt={5}>
              {balance && (
                <Alert icon={<Forbidden2 variant="Outline" size={22} />} severity="error">
                  <Typography variant="body2">{balance}</Typography>
                </Alert>
              )}
              {isCrossReportProfitEqual && (
                <AlertView message={t({ id: 'profitForTheYearMismatchWarningMessage' })} report={reportOfOppositeType} severity="warning" onViewOpen={onViewOpen} />
              )}
            </Box>
          )}
          <Grid container justifyContent="flex-end" mt={5} spacing={1}>
            <Grid>
              <ButtonSecondary type="reset" onClick={handleFormReset} disabled={!dirty}>
                {t({ id: 'resetAll' })}
              </ButtonSecondary>
            </Grid>
            <Grid>
              <ButtonPrimary type="submit" disabled={isSaveDisabled}>
                {t({ id: 'save' })}
              </ButtonPrimary>
            </Grid>
          </Grid>
        </>
      )}
    </Form>
  )
}

type ReportIncomeStatementFormLayoutProps = FormikProps<ReportIncomeStatementFormValues> & {
  errors: FormikErrors<IncomeStatementFormErrorValues>
  reportOfCurrentType?: ReportBalanceSheetApiResponse | ReportIncomeStatementApiResponse
  reportOfOppositeType: ReportBalanceSheetApiResponse | ReportIncomeStatementApiResponse
  warnings?: IncomeStatementWarnings
  onResetWarnings?: () => void
  onViewOpen?: (report: ReportApiResponse) => void
  isPresentationMode?: boolean
  isSaveDisabled: boolean
}

const ReportIncomeStatementFormLayouut = ({
  dirty,
  errors,
  initialValues,
  reportOfCurrentType,
  reportOfOppositeType,
  warnings,
  values,
  resetForm,
  onResetWarnings,
  onViewOpen,
  validateForm,
  isPresentationMode,
  isSaveDisabled
}: ReportIncomeStatementFormLayoutProps) => {
  const { t } = useTranslations()

  const isCrossReportProfitEqual = validateCrossReportProfit(reportOfOppositeType, values)

  const handleFormReset = () => {
    resetForm()
    onResetWarnings?.()
    validateForm(initialValues)
  }

  return (
    <Form>
      {!isPresentationMode && reportOfCurrentType && (
        <Box mb={6}>
          <AlertView
            message={reportOfCurrentType.publish ? t({ id: 'alertPublishedReportMessage' }) : t({ id: 'alertEditReportMessage' })}
            report={reportOfCurrentType}
            severity="warning"
            onViewOpen={onViewOpen}
          />
        </Box>
      )}
      <IncomeGroup errors={errors} warnings={warnings} values={values} isCrossReportProfitEqual={isCrossReportProfitEqual} isPresentationMode={isPresentationMode} />
      {!isPresentationMode && (
        <>
          <Divider />
          {isCrossReportProfitEqual && (
            <Box display="flex" flexDirection="column" gap={3} mt={5}>
              <AlertView message={t({ id: 'profitForTheYearMismatchWarningMessage' })} report={reportOfOppositeType} severity="warning" onViewOpen={onViewOpen} />
            </Box>
          )}
          <Grid container justifyContent="flex-end" mt={5} spacing={1}>
            <Grid>
              <ButtonSecondary type="reset" onClick={handleFormReset} disabled={!dirty}>
                {t({ id: 'resetAll' })}
              </ButtonSecondary>
            </Grid>
            <Grid>
              <ButtonPrimary type="submit" disabled={isSaveDisabled}>
                {t({ id: 'save' })}
              </ButtonPrimary>
            </Grid>
          </Grid>
        </>
      )}
    </Form>
  )
}

const reports = {
  [ReportType.BALANCE_SHEET]: ReportBalanceSheetFormLayout,
  [ReportType.INCOME_STATEMENT]: ReportIncomeStatementFormLayouut
} as const

interface ReportTypeFormReadOnlyProps {
  reportType?: ReportType
  reportOfCurrentType?: undefined
  reportOfOppositeType?: undefined
  warnings?: undefined
  values?: ReportBalanceSheetFormValues | ReportIncomeStatementFormValues
  onSubmit?: undefined
  onValidate?: undefined
  onResetWarnings?: undefined
  onViewOpen?: undefined
  isAutomaticGeneration?: undefined
  isPresentationMode: true
  isFetching: boolean
}

interface ReportTypeFormWriteProps {
  reportType?: ReportType
  reportOfCurrentType?: ReportBalanceSheetApiResponse | ReportIncomeStatementApiResponse
  reportOfOppositeType?: ReportBalanceSheetApiResponse | ReportIncomeStatementApiResponse
  warnings: BalanceSheetWarnings | IncomeStatementWarnings
  values?: ReportBalanceSheetFormValues | ReportIncomeStatementFormValues
  onSubmit: FormikConfig<ReportBalanceSheetFormValues | ReportIncomeStatementFormValues>['onSubmit']
  onValidate: FormikConfig<ReportBalanceSheetFormValues | ReportIncomeStatementFormValues>['validate']
  onResetWarnings: () => void
  onViewOpen: (report: ReportApiResponse) => void
  isAutomaticGeneration?: boolean
  isFetching: boolean
  isPresentationMode?: false
}

type ReportTypeFormProps = ReportTypeFormWriteProps | ReportTypeFormReadOnlyProps

export const ReportTypeForm = ({
  reportOfCurrentType,
  reportOfOppositeType,
  reportType,
  warnings,
  values,
  onSubmit,
  onValidate,
  onResetWarnings,
  onViewOpen,
  isAutomaticGeneration,
  isFetching,
  isPresentationMode
}: ReportTypeFormProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  const fetchedValues = values ? Object.entries(values).reduce((acc, [key, value]) => ({ ...acc, [key]: formatNumber(parseFloat(value)) }), {}) : null

  if (reportType === ReportType.BALANCE_SHEET) {
    const FormComponent = reports[reportType]

    const initialValues = (fetchedValues as ReportBalanceSheetFormValues) ?? initialState[reportType]

    return (
      <Formik<ReportBalanceSheetFormValues>
        component={(props) => {
          const hasErrors = Boolean(Object.keys(props.errors).length)
          const hasNoValues = Object.values(props.values).every((value) => !parseFloat(value))

          const isSaveDisabled = isAutomaticGeneration ? hasNoValues || hasErrors : hasNoValues || hasErrors || !props.dirty

          return (
            <FormComponent
              reportOfCurrentType={reportOfCurrentType as ReportBalanceSheetApiResponse}
              reportOfOppositeType={reportOfOppositeType as ReportIncomeStatementApiResponse}
              warnings={warnings as BalanceSheetWarnings}
              onResetWarnings={onResetWarnings}
              onViewOpen={onViewOpen}
              isPresentationMode={isPresentationMode}
              isSaveDisabled={isSaveDisabled}
              {...props}
            />
          )
        }}
        initialValues={initialValues}
        onSubmit={onSubmit ?? noop}
        validate={onValidate}
        validateOnMount={isAutomaticGeneration}
        enableReinitialize
      />
    )
  }

  if (reportType === ReportType.INCOME_STATEMENT) {
    const FormComponent = reports[reportType]

    const initialValues = (fetchedValues as ReportIncomeStatementFormValues) ?? initialState[reportType]

    return (
      <Formik<ReportIncomeStatementFormValues>
        component={(props) => {
          const hasErrors = Boolean(Object.keys(props.errors).length)
          const hasNoValues = Object.values(props.values).every((value) => !parseFloat(value))

          const isSaveDisabled = isAutomaticGeneration ? hasNoValues || hasErrors : hasNoValues || hasErrors || !props.dirty

          return (
            <FormComponent
              reportOfCurrentType={reportOfCurrentType as ReportIncomeStatementApiResponse}
              reportOfOppositeType={reportOfOppositeType as ReportBalanceSheetApiResponse}
              warnings={warnings as IncomeStatementWarnings}
              onResetWarnings={onResetWarnings}
              onViewOpen={onViewOpen}
              isPresentationMode={isPresentationMode}
              isSaveDisabled={isSaveDisabled}
              {...props}
            />
          )
        }}
        initialValues={initialValues}
        onSubmit={onSubmit ?? noop}
        validate={onValidate}
        validateOnMount={isAutomaticGeneration}
        enableReinitialize
      />
    )
  }

  return null
}
