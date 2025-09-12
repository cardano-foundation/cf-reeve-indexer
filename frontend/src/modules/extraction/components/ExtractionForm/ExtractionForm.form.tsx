import { useTheme } from '@mui/material'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Dayjs } from 'dayjs'
import { Form, Formik, FormikConfig, FormikProps } from 'formik'

import {
  OrganisationChartTypesApiResponse200,
  OrganisationCostCentersApiResponse200,
  OrganisationProjectsApiResponse200,
  OrganisationsApiResponse
} from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { FieldAccountCode } from 'libs/form-kit/components/FieldAccountCode/FieldAccountCode.component.tsx'
import { FieldAccountSubtype } from 'libs/form-kit/components/FieldAccountSubtype/FieldAccountSubtype.component.tsx'
import { FieldAccountType } from 'libs/form-kit/components/FieldAccountType/FieldAccountType.component.tsx'
import { FieldCostCenter } from 'libs/form-kit/components/FieldCostCenter/FieldCostCenter.component.tsx'
import { FieldDateFrom } from 'libs/form-kit/components/FieldDateFrom/FieldDateFrom.component.tsx'
import { FieldDateTo } from 'libs/form-kit/components/FieldDateTo/FieldDateTo.component.tsx'
import { FieldOrganisation } from 'libs/form-kit/components/FieldOrganisation/FieldOrganisation.component.tsx'
import { FieldProject } from 'libs/form-kit/components/FieldProject/FieldProject.component.tsx'
import { useFormExtractionValidation } from 'libs/form-kit/validations/useFormExtractionValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { ExtractionFormValues } from 'modules/extraction/components/ExtractionForm/ExtractionForm.types.ts'
import { useExtractionFormLayout } from 'modules/extraction/components/ExtractionForm/hooks/useExtractionFormLayout.ts'

interface ExtractionFormLayoutProps extends FormikProps<ExtractionFormValues> {
  dateFromMinDate: Dayjs
  dateFromMaxDate: Dayjs
  dateToMinDate: Dayjs
  dateToMaxDate: Dayjs
  organisationChartTypes: OrganisationChartTypesApiResponse200 | null
  organisationCostCenters: OrganisationCostCentersApiResponse200 | null
  organisationProjects: OrganisationProjectsApiResponse200 | null
  organisations: OrganisationsApiResponse | null
  hasInitialValues: boolean
}

const ExtractionFormLayout = ({
  dateFromMinDate,
  dateFromMaxDate,
  dateToMinDate,
  dateToMaxDate,
  dirty,
  organisationChartTypes,
  organisationCostCenters,
  organisationProjects,
  organisations,
  values,
  handleReset,
  setFieldValue,
  hasInitialValues,
  isValid
}: ExtractionFormLayoutProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const {
    accountCodeOptions,
    accountSubtypeOptions,
    accountTypeOptions,
    costCenterOptions,
    projectOptions,
    handleAccountCodeChange,
    handleAccountSubtypeChange,
    handleAccountTypeChange
  } = useExtractionFormLayout(organisationChartTypes, organisationCostCenters, organisationProjects, setFieldValue)

  const isResetAllEnabled = !hasInitialValues ? dirty : dirty || isValid
  const isExtractEnabled = dirty && isValid

  return (
    <Form>
      <Grid container mb={4} size={12} spacing={3}>
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
        <Grid size={12}>
          <FieldCostCenter items={costCenterOptions} />
        </Grid>
        <Grid size={12}>
          <FieldProject items={projectOptions} />
        </Grid>
        <Grid size={12}>
          <FieldAccountType items={accountTypeOptions} onChange={handleAccountTypeChange} />
        </Grid>
        <Grid size={12}>
          <FieldAccountSubtype items={accountSubtypeOptions} onChange={handleAccountSubtypeChange} />
        </Grid>
        <Grid size={12}>
          <FieldAccountCode items={accountCodeOptions} onChange={handleAccountCodeChange} />
        </Grid>
      </Grid>
      <Divider />
      <Grid container mt={4} spacing={4}>
        <Grid alignItems="center" size={{ xs: 12, md: 8 }}>
          <Typography color={theme.palette.text.secondary} variant="body2">
            {t({ id: 'mandatoryFields' })}
          </Typography>
        </Grid>
        <Grid container spacing={1} justifyContent="flex-end" size={{ xs: 12, md: 'grow' }}>
          <Grid>
            <ButtonSecondary type="button" onClick={handleReset} disabled={!isResetAllEnabled}>
              {t({ id: 'resetAll' })}
            </ButtonSecondary>
          </Grid>
          <Grid>
            <ButtonPrimary type="submit" disabled={!isExtractEnabled}>
              {t({ id: 'extract' })}
            </ButtonPrimary>
          </Grid>
        </Grid>
      </Grid>
    </Form>
  )
}

interface ExtractionFormProps {
  dateFromMaxDate: Dayjs
  dateFromMinDate: Dayjs
  dateToMaxDate: Dayjs
  dateToMinDate: Dayjs
  initialValues: ExtractionFormValues
  organisationChartTypes: OrganisationChartTypesApiResponse200 | null
  organisationCostCenters: OrganisationCostCentersApiResponse200 | null
  organisationProjects: OrganisationProjectsApiResponse200 | null
  organisations: OrganisationsApiResponse | null
  validationSchema: ReturnType<typeof useFormExtractionValidation>
  onReset: FormikConfig<ExtractionFormValues>['onReset']
  onSubmit: FormikConfig<ExtractionFormValues>['onSubmit']
  hasInitialValues: boolean
  isFetching: boolean
}

export const ExtractionForm = ({
  dateFromMaxDate,
  dateFromMinDate,
  dateToMaxDate,
  dateToMinDate,
  initialValues,
  organisationChartTypes,
  organisationCostCenters,
  organisationProjects,
  organisations,
  validationSchema,
  onReset,
  onSubmit,
  hasInitialValues,
  isFetching
}: ExtractionFormProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  return (
    <Formik<ExtractionFormValues>
      component={(props) => (
        <ExtractionFormLayout
          dateFromMaxDate={dateFromMaxDate}
          dateFromMinDate={dateFromMinDate}
          dateToMaxDate={dateToMaxDate}
          dateToMinDate={dateToMinDate}
          organisationChartTypes={organisationChartTypes}
          organisationCostCenters={organisationCostCenters}
          organisationProjects={organisationProjects}
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
