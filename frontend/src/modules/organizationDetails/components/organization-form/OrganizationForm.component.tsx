import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikProps } from 'formik'
import { Box2 } from 'iconsax-react'

import { OrganisationApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { FieldSelect } from 'libs/form-kit/components/FieldSelect/FieldSelect.component.tsx'
import { FieldText } from 'libs/form-kit/components/FieldText/FieldText.component.tsx'
import { useFormOrganisationManagerUpdateValidation } from 'libs/form-kit/validations/useFormOrganisationManagerUpdateValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { COUNTRY_CODES } from 'modules/organizationDetails/components/organization-form/Organization.constants.ts'
import { formatCurrency } from 'modules/organizationDetails/components/organization-form/Organization.utils.ts'

interface ExtractionFormLayoutProps extends FormikProps<OrganisationApiResponse> {
  organisation: OrganisationApiResponse
  isEditMode: boolean
}

const OrganizationFormLayout = ({ isEditMode }: ExtractionFormLayoutProps) => {
  const { t } = useTranslations()
  const theme = useTheme()

  const disabled = !isEditMode

  return (
    <Form>
      <Grid container spacing={4} mb={4} mx="auto" size={{ xs: 12, md: 6 }}>
        <Grid container size={12} spacing={3}>
          <Grid alignItems="center" size={{ xs: 12, md: 8 }}>
            <Typography color={theme.palette.text.secondary} component="span" variant="overline" fontWeight={600} letterSpacing={'1px'}>
              {t({ id: 'companyDetails' })}
            </Typography>
          </Grid>
          <Grid size={12}>
            <FieldText name={'name'} label={'name'} disabled={disabled} />
          </Grid>
          <Grid size={12}>
            <FieldText name={'taxIdNumber'} label="taxId" disabled />
          </Grid>
          <Grid size={12}>
            <FieldText name={'adminEmail'} label="email" disabled={disabled} />
          </Grid>
          <Grid size={12}>
            <FieldText name={'phoneNumber'} label="phoneNumber" disabled={disabled} />
          </Grid>
          <Grid size={12}>
            <FieldText name={'websiteUrl'} label="websiteUrl" disabled={disabled} />
          </Grid>
          <Grid size={12}>
            <FieldText name={'address'} label="address" disabled={disabled} />
          </Grid>
          <Grid container size={12}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldText name={'city'} label="city" disabled={disabled} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldText name={'postCode'} label="postCode" disabled={disabled} />
            </Grid>
          </Grid>
          <Grid container size={12}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldText name={'province'} label="province" disabled={disabled} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldSelect label="country" name="countryCode" items={COUNTRY_CODES} disabled />
            </Grid>
          </Grid>
        </Grid>
        <Grid container size={12} spacing={3}>
          <Grid alignItems="center" size={{ xs: 12, md: 8 }}>
            <Typography color={theme.palette.text.secondary} component="h3" variant="overline">
              {t({ id: 'financialSettings' })}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FieldText name={'currencyId'} label="accountingCurrency" formatDisplayValue={formatCurrency} disabled />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FieldText name={'reportCurrencyId'} label="reportingCurrency" formatDisplayValue={formatCurrency} disabled />
          </Grid>
        </Grid>
      </Grid>
    </Form>
  )
}

interface OrganizationFormProps {
  initialValues: OrganisationApiResponse | null
  organisation: OrganisationApiResponse | null
  onSubmit: (values: OrganisationApiResponse) => void
  isFetching: boolean
  isEditMode: boolean
  formikRef: React.Ref<FormikProps<OrganisationApiResponse>>
}

export const OrganizationForm = ({ initialValues, organisation, onSubmit, isFetching, formikRef, isEditMode }: OrganizationFormProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const validationSchema = useFormOrganisationManagerUpdateValidation()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  if (!initialValues || !organisation) {
    return <EmptyStatePage asset={<Box2 color={theme.palette.action.disabled} size={56} variant="Outline" />} message={t({ id: 'nothingHereMessage' })} />
  }

  return (
    <Formik<OrganisationApiResponse>
      component={(props) => <OrganizationFormLayout {...props} organisation={organisation} isEditMode={isEditMode} />}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      enableReinitialize
      innerRef={formikRef}
    />
  )
}
