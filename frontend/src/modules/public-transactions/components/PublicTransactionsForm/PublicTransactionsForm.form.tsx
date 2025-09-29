import { useTheme } from '@mui/material'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Dayjs } from 'dayjs'
import { Form, Formik, FormikConfig, FormikProps } from 'formik'

import { CurrenciesApiResponse, OrganisationsApiResponse } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types.ts'
import { FieldBlockchainHash } from 'libs/form-kit/components/FieldBlockchainHash/FieldBlockchainHash.component.tsx'
import { FieldCurrency } from 'libs/form-kit/components/FieldCurrency/FieldCurrency.component.tsx'
import { FieldDateFrom } from 'libs/form-kit/components/FieldDateFrom/FieldDateFrom.component.tsx'
import { FieldDateTo } from 'libs/form-kit/components/FieldDateTo/FieldDateTo.component.tsx'
import { FieldMaxAmount } from 'libs/form-kit/components/FieldMaxAmount/FieldMaxAmount.component.tsx'
import { FieldMinAmount } from 'libs/form-kit/components/FieldMinAmount/FieldMinAmount.component.tsx'
import { FieldOrganisation } from 'libs/form-kit/components/FieldOrganisation/FieldOrganisation.component.tsx'
import { useFormPublicTransactionsValidation } from 'libs/form-kit/validations/useFormPublicTransactionsValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { PublicTransactionsFormValues } from 'modules/public-transactions/components/PublicTransactionsForm/PublicTransactionsForm.types.ts'

interface TransactionsFormLayoutProps extends FormikProps<PublicTransactionsFormValues> {
  currencies: CurrenciesApiResponse
  dateFromMinDate: Dayjs
  dateFromMaxDate: Dayjs
  dateToMinDate: Dayjs
  dateToMaxDate: Dayjs
  organisations: OrganisationsApiResponse | null
  hasInitialValues: boolean
}

const PublicTransactionsFormLayout = ({
  dateFromMaxDate,
  dateFromMinDate,
  dateToMaxDate,
  dateToMinDate,
  dirty,
  organisations,
  currencies,
  values,
  handleReset,
  hasInitialValues,
  isValid
}: TransactionsFormLayoutProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const currencyOptions = currencies.map((currency) => ({ name: currency.customerCode, value: currency.customerCode }))

  const isResetAllEnabled = !hasInitialValues ? dirty : dirty || isValid
  const isSearchEnabled = dirty && isValid

  return (
    <Form>
      <Grid container mb={4} spacing={{ xs: 2, sm: 3 }}>
        <Grid maxWidth={{ xs: '100%', md: '14.5rem' }} size={{ xs: 12, md: 'grow' }} width="100%">
          <FieldOrganisation organisations={organisations} isDisabled />
        </Grid>
        <Grid container size={12}>
          <Grid maxWidth={{ xs: '100%', md: '14.5rem' }} size={{ xs: 12, md: 'grow' }} width="100%">
            <FieldDateFrom minDate={dateFromMinDate} maxDate={values.dateTo || dateFromMaxDate} />
          </Grid>
          <Grid maxWidth={{ xs: '100%', md: '14.5rem' }} size={{ xs: 12, md: 'grow' }} width="100%">
            <FieldDateTo minDate={values.dateFrom || dateToMinDate} maxDate={dateToMaxDate} />
          </Grid>
        </Grid>
        <Grid container size={12}>
          <Grid maxWidth={{ xs: '100%', md: '14.5rem' }} size={{ xs: 12, md: 'grow' }} width="100%">
            <FieldCurrency items={currencyOptions} />
          </Grid>
          <Grid maxWidth={{ xs: '100%', md: '14.5rem' }} size={{ xs: 12, md: 'grow' }} width="100%">
            <FieldMinAmount />
          </Grid>
          <Grid maxWidth={{ xs: '100%', md: '14.5rem' }} size={{ xs: 12, md: 'grow' }} width="100%">
            <FieldMaxAmount />
          </Grid>
        </Grid>
        <Grid size={12}>
          <FieldBlockchainHash />
        </Grid>
      </Grid>
      <Divider />
      <Grid container spacing={4} mt={4}>
        <Grid alignItems="center" size={{ xs: 12, md: 8 }}>
          <Typography color={theme.palette.text.secondary} variant="body2">
            {t({ id: 'mandatoryFields' })}
          </Typography>
        </Grid>
        <Grid container justifyContent="flex-end" size={{ xs: 12, md: 'grow' }} spacing={1}>
          <Grid size="auto">
            <ButtonSecondary type="button" onClick={handleReset} disabled={!isResetAllEnabled}>
              {t({ id: 'resetAll' })}
            </ButtonSecondary>
          </Grid>
          <Grid size="auto">
            <ButtonPrimary type="submit" disabled={!isSearchEnabled}>
              {t({ id: 'search' })}
            </ButtonPrimary>
          </Grid>
        </Grid>
      </Grid>
    </Form>
  )
}

interface PublicTransactionsFormProps {
  currencies: CurrenciesApiResponse
  dateFromMaxDate: Dayjs
  dateFromMinDate: Dayjs
  dateToMaxDate: Dayjs
  dateToMinDate: Dayjs
  initialValues: PublicTransactionsFormValues
  organisations: OrganisationsApiResponse | null
  validationSchema: ReturnType<typeof useFormPublicTransactionsValidation>
  onReset: FormikConfig<PublicTransactionsFormValues>['onReset']
  onSubmit: FormikConfig<PublicTransactionsFormValues>['onSubmit']
  hasInitialValues: boolean
  isFetching: boolean
}

export const PublicTransactionsForm = ({
  currencies,
  dateFromMaxDate,
  dateFromMinDate,
  dateToMaxDate,
  dateToMinDate,
  initialValues,
  organisations,
  validationSchema,
  onReset,
  onSubmit,
  hasInitialValues,
  isFetching
}: PublicTransactionsFormProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  return (
    <Formik<PublicTransactionsFormValues>
      component={(props) => (
        <PublicTransactionsFormLayout
          currencies={currencies}
          dateFromMaxDate={dateFromMaxDate}
          dateFromMinDate={dateFromMinDate}
          dateToMaxDate={dateToMaxDate}
          dateToMinDate={dateToMinDate}
          organisations={organisations}
          hasInitialValues={hasInitialValues}
          {...props}
        />
      )}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onReset={onReset}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnChange
      validateOnMount
    />
  )
}
