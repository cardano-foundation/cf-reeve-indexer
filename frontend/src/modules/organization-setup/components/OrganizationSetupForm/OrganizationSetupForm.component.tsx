import { useTheme } from '@mui/material'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikConfig, FormikProps } from 'formik'

import { templateChartOfAccounts, templateCostCenters, templateEventCodes, templateReferenceCodes, templateVatCodes } from 'assets/files'
import { FieldOrganizationSetupType } from 'libs/form-kit/components/FieldOrganizationSetupType/FieldOrganizationSetupType.component.tsx'
import { FieldUploadFile } from 'libs/form-kit/components/FieldUploadFile/FieldUploadFile.component.tsx'
import { useFormOrganizationSetupValidation } from 'libs/form-kit/validations/useFormOrganizationSetupValidation.ts'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ErrorDetails } from 'libs/ui-kit/components/ErrorDetails/ErrorDetails.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { WarningDetails } from 'libs/ui-kit/components/WarningDetails/WarningDetails.component.tsx'
import { OrganizationSetupFormValues, SetupType } from 'modules/organization-setup/components/OrganizationSetupForm/OrganizationSetupForm.types.ts'
import { ErrorDetail, WarningDetail } from 'modules/organization-setup/hooks/useOrganizationSetupForm.ts'

const TEMPLATES_SETUP = {
  [SetupType.CHART_OF_ACCOUNTS]: templateChartOfAccounts,
  [SetupType.COST_CENTERS]: templateCostCenters,
  [SetupType.VAT_CODES]: templateVatCodes,
  [SetupType.EVENT_CODES]: templateEventCodes,
  [SetupType.REFERENCE_CODES]: templateReferenceCodes
} as const

const TEMPLATES_SETUP_NAMES = {
  [SetupType.CHART_OF_ACCOUNTS]: 'template-chart-of-accounts.csv',
  [SetupType.COST_CENTERS]: 'template-cost-centers.csv',
  [SetupType.VAT_CODES]: 'template-vat-codes.csv',
  [SetupType.EVENT_CODES]: 'template-event-codes.csv',
  [SetupType.REFERENCE_CODES]: 'template-reference-codes.csv'
} as const

interface OrganizationSetupFormLayoutProps extends FormikProps<OrganizationSetupFormValues> {
  onDialogErrorsSummaryOpen: () => void
  onDialogOrganizationSetupOpen: () => void
  apiErrors: ErrorDetail[] | null
  apiWarnings: WarningDetail[] | null
}

const OrganizationSetupFormLayout = ({
  apiErrors,
  apiWarnings,
  dirty,
  values,
  onDialogErrorsSummaryOpen,
  onDialogOrganizationSetupOpen,
  isValid,
  isSubmitting
}: OrganizationSetupFormLayoutProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const isImportEnabled = (dirty && isValid) || !hasPermission('organization_setup', 'import')

  return (
    <Form id="organization-setup-form">
      <Grid container mb={4} spacing={3}>
        <Grid size={12} px={2}>
          <FieldOrganizationSetupType disabled={isSubmitting} />
        </Grid>
        <Grid size={12}>
          <Typography color={theme.palette.text.secondary} variant="body2" whiteSpace="pre-wrap">
            {t(
              { id: 'importFromFileSubtitle' },
              {
                a: (chunks) => (
                  <Link
                    color={theme.palette.info.dark}
                    href={TEMPLATES_SETUP[values.setupType]}
                    fontWeight={600}
                    underline="none"
                    download={TEMPLATES_SETUP_NAMES[values.setupType]}
                  >
                    {chunks}
                  </Link>
                )
              }
            )}
          </Typography>
        </Grid>
        <Grid size={12}>
          <FieldUploadFile isClearDisabled={isSubmitting} isUploadDisabled={isSubmitting} />
        </Grid>
      </Grid>
      <Divider />
      {apiErrors && apiErrors.length > 0 && (
        <ErrorDetails errors={apiErrors} onDetailsClick={onDialogErrorsSummaryOpen} hasDetails={apiErrors.some(({ title }) => title === 'CSV_PARSING_ERROR')} />
      )}
      {apiWarnings && apiWarnings.length > 0 && <WarningDetails onDetailsClick={onDialogErrorsSummaryOpen} />}
      <Grid container spacing={3} mt={4}>
        <Grid display="flex" justifyContent="flex-end" size={12}>
          <ButtonPrimary
            startIcon={isSubmitting ? <LoaderCentered size={20} /> : null}
            type="button"
            onClick={onDialogOrganizationSetupOpen}
            disabled={isSubmitting || !isImportEnabled}
          >
            {t({ id: 'importSetupData' })}
          </ButtonPrimary>
        </Grid>
      </Grid>
    </Form>
  )
}

interface OrganizationSetupFormProps {
  apiErrors: ErrorDetail[] | null
  apiWarnings: WarningDetail[] | null
  initialValues: OrganizationSetupFormValues
  validationSchema: ReturnType<typeof useFormOrganizationSetupValidation>
  onDialogErrorsSummaryOpen: () => void
  onDialogOrganizationSetupOpen: () => void
  onSubmit: FormikConfig<OrganizationSetupFormValues>['onSubmit']
}

export const OrganizationSetupForm = ({
  apiErrors,
  apiWarnings,
  initialValues,
  validationSchema,
  onDialogErrorsSummaryOpen,
  onDialogOrganizationSetupOpen,
  onSubmit
}: OrganizationSetupFormProps) => {
  return (
    <Formik<OrganizationSetupFormValues>
      component={(props) => (
        <OrganizationSetupFormLayout
          apiErrors={apiErrors}
          apiWarnings={apiWarnings}
          onDialogErrorsSummaryOpen={onDialogErrorsSummaryOpen}
          onDialogOrganizationSetupOpen={onDialogOrganizationSetupOpen}
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
