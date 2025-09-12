import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Form, Formik, FormikConfig, FormikProps } from 'formik'
import { InfoCircle } from 'iconsax-react'
import { useEffect, useState } from 'react'

import { GetChartOfAccountResponse200 } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types'
import { OrganisationApiResponse, OrganisationChartTypesApiResponse200 } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { RefCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { FieldActive } from 'libs/form-kit/components/FieldActive/FieldActive.component.tsx'
import { FieldBalanceFCY } from 'libs/form-kit/components/FieldBalanceFCY/FieldBalanceFCY.component'
import { FieldBalanceLCY } from 'libs/form-kit/components/FieldBalanceLCY/FieldBalanceLCY.component'
import { FieldBalanceType } from 'libs/form-kit/components/FieldBalanceType/FieldBalanceType.component.tsx'
import { FieldCounterparty } from 'libs/form-kit/components/FieldCounterparty/FieldCounterparty.component.tsx'
import { FieldCurrency } from 'libs/form-kit/components/FieldCurrency/FieldCurrency.component.tsx'
import { FieldDate } from 'libs/form-kit/components/FieldDate/FieldDate.component.tsx'
import { FieldDescription } from 'libs/form-kit/components/FieldDescription/FieldDescription.component.tsx'
import { FieldNumber } from 'libs/form-kit/components/FieldNumber/FieldNumber.component.tsx'
import { FieldOpeningBalance } from 'libs/form-kit/components/FieldOpeningBalance/FieldOpeningBalance.component.tsx'
import { FieldParentCode } from 'libs/form-kit/components/FieldParentCode/FieldParentCode.component.tsx'
import { FieldParentLink } from 'libs/form-kit/components/FieldParentLink/FieldParentLink.component.tsx'
import { FieldReferenceCode } from 'libs/form-kit/components/FieldReferenceCode/FieldReferenceCode.component.tsx'
import { FieldSubtype } from 'libs/form-kit/components/FieldSubtype/FieldSubtype.component.tsx'
import { FieldType } from 'libs/form-kit/components/FieldType/FieldType.component.tsx'
import { useFormChartOfAccountValidation } from 'libs/form-kit/validations/useFormChartOfAccountValidation.ts'
import { useGetOrganisationChartTypesModel } from 'libs/models/organisation-model/GetOrganisationChartTypes/GetOrganisationChartTypesModel.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { ChartOfAccountFormValues } from 'modules/chart-of-accounts/components/ChartOfAccountForm/ChartOfAccountForm.types.ts'
import {
  getAllSubTypes,
  getCurrencyOptions,
  getParentCodeOptions,
  getReferenceCodeOptions,
  getSubtypeOptions,
  getTypeOptions
} from 'modules/chart-of-accounts/components/ChartOfAccountForm/ChartOfAccountForm.utils.ts'
import { useRefCodesQueries } from 'modules/event-ref-codes/hooks/useRefCodesQueries'

interface ChartOfAccountFormLayoutProps extends FormikProps<ChartOfAccountFormValues> {
  organisation: OrganisationApiResponse | null
  chartOfAccounts: GetChartOfAccountResponse200
  organisationChartTypes: OrganisationChartTypesApiResponse200
  refCodes: RefCodeResponse[]
  isEditMode: boolean
}

export const ChartOfAccountFormLayout = ({ organisation, chartOfAccounts, values, organisationChartTypes, refCodes, setFieldValue, isEditMode }: ChartOfAccountFormLayoutProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const [accountTypeOptions, setAccountTypeOptions] = useState<SelectOption[]>([])
  const [accountSubTypeOptions, setAccountSubTypeOptions] = useState<SelectOption[]>([])

  const currencyOptions = getCurrencyOptions(organisation?.organisationCurrencies)
  const parentCodeOptions = getParentCodeOptions(chartOfAccounts, values.customerCode)

  const referenceCodeOptions = getReferenceCodeOptions(refCodes.map((code) => ({ name: code.description, value: code.referenceCode })))

  useEffect(() => {
    if (organisationChartTypes.length) {
      setAccountTypeOptions(getTypeOptions(organisationChartTypes))
    }
  }, [organisationChartTypes])

  useEffect(() => {
    if (values.type) {
      const newSubTypeOptions = getSubtypeOptions(organisationChartTypes, values.type)
      setAccountSubTypeOptions(newSubTypeOptions)

      const isSubTypeIsIncludedInNewOptins = newSubTypeOptions.some((type) => type.value === values.subType)
      !isSubTypeIsIncludedInNewOptins && setFieldValue('subType', '')
      return
    }

    const isNoTypeOrSubtypeSelected = !values.type && !values.subType
    if (isNoTypeOrSubtypeSelected) {
      return setAccountSubTypeOptions(getAllSubTypes(organisationChartTypes))
    }

    const isOnlySubtypeSelected = values.subType && !values.type
    if (isOnlySubtypeSelected) {
      const chart = organisationChartTypes.find((chart) => chart.subType.find((subtype) => subtype.id === values.subType))
      chart && setFieldValue('type', chart.id)
    }
  }, [values.type, values.subType])

  return (
    <Form id="chart-of-account-form">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FieldNumber disabled={isEditMode} />
        </Grid>
        <Grid size={12}>
          <FieldDescription />
        </Grid>
        <Grid size={12}>
          <FieldCounterparty />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} wrap="wrap">
          <FieldCurrency items={currencyOptions} />
        </Grid>
        <Grid container spacing={3} size={12}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldType items={accountTypeOptions} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldSubtype items={accountSubTypeOptions} />
          </Grid>
        </Grid>
        <Grid size={12}>
          <FieldReferenceCode items={referenceCodeOptions} />
        </Grid>
        <Grid container spacing={3} size={12}>
          <Grid size={12}>
            <FieldParentLink />
          </Grid>
          <Grid ml={4} size="grow">
            <FieldParentCode items={parentCodeOptions} disabled={!values.hasParent} required={values.hasParent} />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid size={12}>
            <FieldOpeningBalance />
          </Grid>
          <Grid container spacing={3} size="grow">
            <Grid ml={4} size="grow">
              <FieldDate disabled={!values.hasBalance} />
            </Grid>
            <Grid alignItems="center" container size="auto">
              <Tooltip title={t({ id: 'openingBalanceHint' })}>
                <InfoCircle color={theme.palette.action.active} size={16} variant="Outline" />
              </Tooltip>
            </Grid>
            <Grid size="grow">
              <FieldBalanceType disabled={!values.hasBalance} />
            </Grid>
          </Grid>
          <Grid ml={4} size={12}>
            <FieldBalanceFCY items={currencyOptions} disabled={!values.hasBalance} hasAdornment />
          </Grid>
          <Grid ml={4} size={12}>
            <FieldBalanceLCY currency={organisation?.currencyId?.slice(-3)} disabled={!values.hasBalance} />
          </Grid>
        </Grid>
        <Grid size={12}>
          <FieldActive />
        </Grid>
      </Grid>
    </Form>
  )
}

interface ChartOfAccountFormProps {
  initialValues: ChartOfAccountFormValues
  chartOfAccounts: GetChartOfAccountResponse200
  organisation: OrganisationApiResponse | null
  onSubmit: FormikConfig<ChartOfAccountFormValues>['onSubmit']
  isFetching: boolean
  isEditMode: boolean
}

export const ChartOfAccountForm = ({ initialValues, chartOfAccounts, organisation, onSubmit, isFetching, isEditMode }: ChartOfAccountFormProps) => {
  const { t } = useTranslations()

  const existingCodes = chartOfAccounts.map(({ customerCode }) => customerCode)
  const selectedOrganisation = useSelectedOrganisation()

  const validationSchema = useFormChartOfAccountValidation(isEditMode, existingCodes)

  const { organisationChartTypes, isOrganisationChartTypesFetching } = useGetOrganisationChartTypesModel({ id: selectedOrganisation })
  const { refCodes, isFetching: isRefCodesFetching } = useRefCodesQueries()

  if (isFetching || isOrganisationChartTypesFetching || isRefCodesFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  return (
    <Formik<ChartOfAccountFormValues>
      component={(props) => (
        <ChartOfAccountFormLayout
          chartOfAccounts={chartOfAccounts}
          organisationChartTypes={organisationChartTypes}
          refCodes={refCodes}
          organisation={organisation}
          isEditMode={isEditMode}
          {...props}
        />
      )}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnMount
    />
  )
}
