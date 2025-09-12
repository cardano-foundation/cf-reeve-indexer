import Grid from '@mui/material/Grid'
import { Dayjs } from 'dayjs'
import { Form, Formik, FormikProps } from 'formik'

import { OrganisationsApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { FieldDataSource } from 'libs/form-kit/components/FieldDataSource/FieldDataSource.component.tsx'
import { FieldDateFrom } from 'libs/form-kit/components/FieldDateFrom/FieldDateFrom.component.tsx'
import { FieldDateTo } from 'libs/form-kit/components/FieldDateTo/FieldDateTo.component.tsx'
import { FieldOrganisation } from 'libs/form-kit/components/FieldOrganisation/FieldOrganisation.component.tsx'
import { useFormReconciliationValidation } from 'libs/form-kit/validations/useFormReconciliationValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { ReconciliationFormValues } from 'modules/reconciliation/components/ReconciliationForm/ReconciliationForm.types.ts'

interface ReconciliationFormLayoutProps extends FormikProps<ReconciliationFormValues> {
  dateFromMaxDate: Dayjs
  dateFromMinDate: Dayjs
  dateToMaxDate: Dayjs
  dateToMinDate: Dayjs
  organisations: OrganisationsApiResponse | null
}

const ReconciliationFormLayout = ({ dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, organisations, values }: ReconciliationFormLayoutProps) => {
  return (
    <Form id="reconciliation-form">
      <Grid container flexDirection="column" spacing={3}>
        <Grid container size={12}>
          <Grid size={{ xs: 12, md: 'grow' }}>
            <FieldOrganisation organisations={organisations} isDisabled />
          </Grid>
          <Grid size={{ xs: 12, md: 'grow' }}>
            <FieldDataSource items={[{ name: 'Oracle Netsuite', value: 'oracleNetsuite' }]} isDisabled />
          </Grid>
        </Grid>
        <Grid container size={12}>
          <Grid size={{ xs: 12, md: 'grow' }}>
            <FieldDateFrom minDate={dateFromMinDate} maxDate={values.dateTo || dateFromMaxDate} />
          </Grid>
          <Grid size={{ xs: 12, md: 'grow' }}>
            <FieldDateTo minDate={values.dateFrom || dateToMinDate} maxDate={dateToMaxDate} />
          </Grid>
        </Grid>
      </Grid>
    </Form>
  )
}

interface ReconciliationFormProps {
  dateFromMaxDate: Dayjs
  dateFromMinDate: Dayjs
  dateToMaxDate: Dayjs
  dateToMinDate: Dayjs
  initialValues: ReconciliationFormValues
  organisations: OrganisationsApiResponse | null
  validationSchema: ReturnType<typeof useFormReconciliationValidation>
  onSubmit: (values: ReconciliationFormValues) => Promise<void>
  isFetching: boolean
}

export const ReconciliationForm = ({
  dateFromMaxDate,
  dateFromMinDate,
  dateToMaxDate,
  dateToMinDate,
  initialValues,
  organisations,
  validationSchema,
  onSubmit,
  isFetching
}: ReconciliationFormProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  return (
    <Formik<ReconciliationFormValues>
      component={(props) => (
        <ReconciliationFormLayout
          dateFromMaxDate={dateFromMaxDate}
          dateFromMinDate={dateFromMinDate}
          dateToMaxDate={dateToMaxDate}
          dateToMinDate={dateToMinDate}
          organisations={organisations}
          {...props}
        />
      )}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      validateOnChange
      validateOnBlur
    />
  )
}
