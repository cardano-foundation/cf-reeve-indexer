import Grid from '@mui/material/Grid'
import { Form, Formik, FormikProps } from 'formik'

import { GetCostCentersResponse200 } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'
import { OrganisationApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { FieldActive } from 'libs/form-kit/components/FieldActive/FieldActive.component.tsx'
import { FieldCode } from 'libs/form-kit/components/FieldCode/FieldCode.component.tsx'
import { FieldDescription } from 'libs/form-kit/components/FieldDescription/FieldDescription.component.tsx'
import { FieldParentCode } from 'libs/form-kit/components/FieldParentCode/FieldParentCode.component.tsx'
import { FieldParentLink } from 'libs/form-kit/components/FieldParentLink/FieldParentLink.component.tsx'
import { useFormCostCenterValidation } from 'libs/form-kit/validations/useFormCostCenterValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { CostCenterFormValues } from 'modules/cost-centers/components/CostCenterForm/CostCenterForm.types.ts'
import { getParentCodeOptions } from 'modules/cost-centers/components/CostCenterForm/CostCenterForm.utils.ts'

interface CostCenterFormLayoutProps extends FormikProps<CostCenterFormValues> {
  organisation: OrganisationApiResponse | null
  costCenters: GetCostCentersResponse200
  isEditMode: boolean
}

export const CostCenterFormLayout = ({ costCenters, values, isEditMode }: CostCenterFormLayoutProps) => {
  const parentCodeOptions = getParentCodeOptions(costCenters, values.code)

  return (
    <Form id="cost-center-form">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FieldCode disabled={isEditMode} />
        </Grid>
        <Grid size={12}>
          <FieldDescription />
        </Grid>
        <Grid container size={12}>
          <Grid size={12}>
            <FieldParentLink />
          </Grid>
          <Grid ml={4} size="grow">
            <FieldParentCode items={parentCodeOptions} disabled={!values.hasParent} required={values.hasParent} name="parentCode" />
          </Grid>
        </Grid>
        <Grid size={12}>
          <FieldActive />
        </Grid>
      </Grid>
    </Form>
  )
}

interface CostCenterFormProps {
  initialValues: CostCenterFormValues
  costCenters: GetCostCentersResponse200
  organisation: OrganisationApiResponse | null
  onSubmit: (values: CostCenterFormValues) => void
  isFetching: boolean
  isEditMode: boolean
}

export const CostCenterForm = ({ initialValues, costCenters, organisation, onSubmit, isFetching, isEditMode }: CostCenterFormProps) => {
  const { t } = useTranslations()

  const existingCodes = costCenters.map(({ customerCode }) => customerCode)

  const validationSchema = useFormCostCenterValidation(isEditMode, existingCodes)

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  return (
    <Formik<CostCenterFormValues>
      component={(props) => <CostCenterFormLayout costCenters={costCenters} organisation={organisation} isEditMode={isEditMode} {...props} />}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnMount
    />
  )
}
