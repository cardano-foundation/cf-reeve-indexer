import Grid from '@mui/material/Grid'
import { Form, Formik, FormikConfig, FormikProps } from 'formik'

import { GetVatCodesResponse200 } from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.types.ts'
import { FieldActive } from 'libs/form-kit/components/FieldActive/FieldActive.component.tsx'
import { FieldCode } from 'libs/form-kit/components/FieldCode/FieldCode.component.tsx'
import { FieldCountryCodes } from 'libs/form-kit/components/FieldCountryCodes/FieldCountryCodes.component.tsx'
import { FieldDescription } from 'libs/form-kit/components/FieldDescription/FieldDescription.component.tsx'
import { FieldRate } from 'libs/form-kit/components/FieldRate/FieldRate.component.tsx'
import { useFormVatCodeValidation } from 'libs/form-kit/validations/useFormVatCodeValidation.ts'
import { VatCodeFormValues } from 'modules/vat-codes/components/VatCodeForm/VatCodeForm.types.ts'
import { getCountryCodeOptions } from 'modules/vat-codes/components/VatCodeForm/VatCodeForm.utils.ts'

interface VatCodeFormLayoutProps extends FormikProps<VatCodeFormValues> {
  isEditMode: boolean
}

export const VatCodeFormLayout = ({ isEditMode }: VatCodeFormLayoutProps) => {
  const countryCodeOptions = getCountryCodeOptions()

  return (
    <Form id="vat-code-form">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FieldCode disabled={isEditMode} />
        </Grid>
        <Grid size={12}>
          <FieldDescription />
        </Grid>
        <Grid container size={{ xs: 12, sm: 6 }}>
          <Grid size={12}>
            <FieldCountryCodes items={countryCodeOptions} />
          </Grid>
          <Grid size={12}>
            <FieldRate />
          </Grid>
        </Grid>
        <Grid size={12}>
          <FieldActive />
        </Grid>
      </Grid>
    </Form>
  )
}

interface VatCodeFormProps {
  initialValues: VatCodeFormValues
  vatCodes: GetVatCodesResponse200
  onSubmit: FormikConfig<VatCodeFormValues>['onSubmit']
  isEditMode: boolean
}

export const VatCodeForm = ({ initialValues, vatCodes, onSubmit, isEditMode }: VatCodeFormProps) => {
  const existingCodes = vatCodes.map(({ customerCode }) => customerCode)

  const validationSchema = useFormVatCodeValidation(isEditMode, existingCodes)

  return (
    <Formik<VatCodeFormValues>
      component={(props) => <VatCodeFormLayout isEditMode={isEditMode} {...props} />}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnMount
    />
  )
}
