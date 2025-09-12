import { useTheme } from '@mui/material'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { Dayjs } from 'dayjs'
import { Form, Formik, FormikConfig, FormikProps } from 'formik'
import { InfoCircle } from 'iconsax-react'

import { templateTransactions } from 'assets/files'
import { OrganisationsApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { FieldDataSource } from 'libs/form-kit/components/FieldDataSource/FieldDataSource.component.tsx'
import { FieldDateFrom } from 'libs/form-kit/components/FieldDateFrom/FieldDateFrom.component.tsx'
import { FieldDateTo } from 'libs/form-kit/components/FieldDateTo/FieldDateTo.component.tsx'
import { FieldImportType } from 'libs/form-kit/components/FieldImportType/FieldImportType.component.tsx'
import { FieldOrganisation } from 'libs/form-kit/components/FieldOrganisation/FieldOrganisation.component.tsx'
import { FieldTransactionNumbers } from 'libs/form-kit/components/FieldTransactionNumbers/FieldTransactionNumbers.component.tsx'
import { FieldTransactionTypes } from 'libs/form-kit/components/FieldTransactionTypes/FieldTransactionTypes.component.tsx'
import { FieldUploadFile } from 'libs/form-kit/components/FieldUploadFile/FieldUploadFile.component.tsx'
import { useFormImportValidation } from 'libs/form-kit/validations/useFormImportValidation.ts'
import { TransactionsTypesDTO } from 'libs/models/transactions-model/GetTransactionsTypes/GetTransactionTypes.types.ts'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { ErrorDetails } from 'libs/ui-kit/components/ErrorDetails/ErrorDetails.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { ImportFormValues, ImportType } from 'modules/import/components/ImportForm/ImportForm.types.ts'
import { ErrorDetail } from 'modules/import/hooks/useImportForm.ts'

interface ExtractionFormLayoutProps extends FormikProps<ImportFormValues> {
  apiErrors: ErrorDetail[] | null
  dateFromMaxDate: Dayjs
  dateFromMinDate: Dayjs
  dateToMaxDate: Dayjs
  dateToMinDate: Dayjs
  organisations: OrganisationsApiResponse | null
  transactionTypes: TransactionsTypesDTO | null
  onDialogErrorsSummaryOpen: () => void
}

const ImportFormLayout = ({
  apiErrors,
  dateFromMaxDate,
  dateFromMinDate,
  dateToMaxDate,
  dateToMinDate,
  dirty,
  organisations,
  transactionTypes,
  values,
  onDialogErrorsSummaryOpen,
  isValid,
  isSubmitting
}: ExtractionFormLayoutProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const isImportEnabled = (dirty && isValid) || !hasPermission('transactions', 'import')
  const isImportFromERP = values.importType === ImportType.ERP
  const isImportFromFile = values.importType === ImportType.FILE

  return (
    <Form>
      <Grid container mb={4} spacing={3}>
        <Grid container size={12}>
          <Grid size={12}>
            <FieldImportType label={t({ id: 'importFromErp' })} value={ImportType.ERP} disabled={isSubmitting} />
          </Grid>
          <Grid container mx={3.5} size={12}>
            <Grid container size={12}>
              <Grid maxWidth={{ xs: '100%', md: '14.5rem' }} size={{ xs: 12, md: 'grow' }} width="100%">
                <FieldOrganisation organisations={organisations} isDisabled />
              </Grid>
              <Grid maxWidth={{ xs: '100%', md: '14.5rem' }} size={{ xs: 12, md: 'grow' }} width="100%">
                <FieldDataSource items={[{ name: 'Oracle Netsuite', value: 'oracleNetsuite' }]} isDisabled />
              </Grid>
            </Grid>
            <Grid container size={12} wrap="nowrap">
              <Grid container size={{ sm: 12, md: 8.75 }}>
                <Grid maxWidth={{ xs: '100%', md: '14.5rem' }} size={{ xs: 12, md: 'grow' }} width="100%">
                  <FieldDateFrom minDate={dateFromMinDate} maxDate={values.dateTo || dateFromMaxDate} isDisabled={isSubmitting || isImportFromFile} />
                </Grid>
                <Grid maxWidth={{ xs: '100%', md: '14.5rem' }} size={{ xs: 12, md: 'grow' }} width="100%">
                  <FieldDateTo minDate={values.dateFrom || dateToMinDate} maxDate={dateToMaxDate} isDisabled={isSubmitting || isImportFromFile} />
                </Grid>
              </Grid>
              <Grid alignItems="center" container size="auto">
                <Tooltip title={t({ id: 'selectableDatesTooltip' })}>
                  <InfoCircle color={theme.palette.action.active} size={16} variant="Outline" />
                </Tooltip>
              </Grid>
            </Grid>
            {transactionTypes && (
              <Grid container size={12}>
                <Grid size={12}>
                  <FieldTransactionTypes items={transactionTypes} isDisabled={isSubmitting || isImportFromFile} />
                </Grid>
              </Grid>
            )}
            <Grid container size={12}>
              <Grid size={12}>
                <FieldTransactionNumbers isDisabled={isSubmitting || isImportFromFile} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container size={12}>
          <Grid size={12}>
            <FieldImportType label={t({ id: 'importFromFile' })} value={ImportType.FILE} disabled={isSubmitting} />
          </Grid>
          <Grid container mx={3.5} size={12}>
            <Grid container size={12}>
              <Typography color={theme.palette.text.secondary} variant="body2" whiteSpace="pre-wrap">
                {t(
                  { id: 'importFromFileSubtitle' },
                  {
                    a: (chunks) => (
                      <Link color={theme.palette.info.dark} href={templateTransactions} fontWeight={600} underline="none" download="template-transactions.csv">
                        {chunks}
                      </Link>
                    )
                  }
                )}
              </Typography>
            </Grid>
            <Grid container size={12}>
              <FieldUploadFile isClearDisabled={isSubmitting} isUploadDisabled={isImportFromERP} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider />
      {apiErrors && apiErrors.length > 0 && <ErrorDetails errors={apiErrors} onDetailsClick={onDialogErrorsSummaryOpen} hasDetails />}
      <Grid container mt={4} spacing={3}>
        <Grid display="flex" alignItems="center" size={{ xs: 12, md: 8 }}>
          <Typography color={theme.palette.text.secondary} variant="body2">
            {t({ id: 'mandatoryFields' })}
          </Typography>
        </Grid>
        <Grid display="flex" justifyContent="flex-end" size={{ xs: 12, md: 4 }}>
          <ButtonPrimary startIcon={isSubmitting ? <LoaderCentered size={20} /> : null} type="submit" disabled={isSubmitting || !isImportEnabled}>
            {t({ id: 'importTransactions' })}
          </ButtonPrimary>
        </Grid>
      </Grid>
    </Form>
  )
}

interface ImportFormProps {
  apiErrors: ErrorDetail[] | null
  dateFromMaxDate: Dayjs
  dateFromMinDate: Dayjs
  dateToMaxDate: Dayjs
  dateToMinDate: Dayjs
  initialValues: ImportFormValues
  organisations: OrganisationsApiResponse | null
  transactionTypes: TransactionsTypesDTO | null
  validationSchema: ReturnType<typeof useFormImportValidation>
  onDialogErrorsSummaryOpen: () => void
  onSubmit: FormikConfig<ImportFormValues>['onSubmit']
  isFetching: boolean
}

export const ImportForm = ({
  apiErrors,
  dateFromMaxDate,
  dateFromMinDate,
  dateToMaxDate,
  dateToMinDate,
  initialValues,
  organisations,
  transactionTypes,
  validationSchema,
  onDialogErrorsSummaryOpen,
  onSubmit,
  isFetching
}: ImportFormProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  return (
    <Formik<ImportFormValues>
      component={(props) => (
        <ImportFormLayout
          apiErrors={apiErrors}
          dateFromMaxDate={dateFromMaxDate}
          dateFromMinDate={dateFromMinDate}
          dateToMaxDate={dateToMaxDate}
          dateToMinDate={dateToMinDate}
          organisations={organisations}
          transactionTypes={transactionTypes}
          onDialogErrorsSummaryOpen={onDialogErrorsSummaryOpen}
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
