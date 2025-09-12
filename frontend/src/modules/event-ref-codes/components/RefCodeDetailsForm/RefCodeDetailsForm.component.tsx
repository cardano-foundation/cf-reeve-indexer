import Grid from '@mui/material/Grid'
import { Form, Formik, FormikConfig, FormikProps } from 'formik'

import { GetRefCodesResponse200 } from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi.types.ts'
import { FieldActive } from 'libs/form-kit/components/FieldActive/FieldActive.component.tsx'
import { FieldDescription } from 'libs/form-kit/components/FieldDescription/FieldDescription.component.tsx'
import { FieldParentLink } from 'libs/form-kit/components/FieldParentLink/FieldParentLink.component.tsx'
import { FieldSelect } from 'libs/form-kit/components/FieldSelect/FieldSelect.component.tsx'
import { FieldText } from 'libs/form-kit/components/FieldText/FieldText.component.tsx'
import { useFormRefCodeValidation } from 'libs/form-kit/validations/useFormRefCodeValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { RefCodeFormValues } from 'modules/event-ref-codes/components/RefCodeDetailsForm/RefCodeDetailsForm.types.ts'

interface RefCodeDetailsFormLayoutProps extends FormikProps<RefCodeFormValues> {
  refCodeOptions: SelectOption[]
  isEditMode: boolean
}

export const RefCodeDetailsFormLayout = ({ values, refCodeOptions, isEditMode }: RefCodeDetailsFormLayoutProps) => {
  return (
    <Form id="ref-codes-form">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FieldText label="referenceCode" name="referenceCode" required disabled={isEditMode} />
        </Grid>
        <Grid size={12}>
          <FieldDescription />
        </Grid>
        <Grid size={12}>
          <FieldParentLink />
        </Grid>
        <Grid ml={4} size={12}>
          <FieldSelect label="parentCode" name="parentReferenceCode" items={refCodeOptions} disabled={!values.hasParent} required={values.hasParent} />
        </Grid>
        <Grid size={12}>
          <FieldActive />
        </Grid>
      </Grid>
    </Form>
  )
}

interface RefCodeDetailsFormProps {
  initialValues: RefCodeFormValues
  refCodeOptions: SelectOption[]
  refCodes: GetRefCodesResponse200
  onSubmit: FormikConfig<RefCodeFormValues>['onSubmit']
  isEditMode: boolean
  isFetching: boolean
}

export const RefCodeDetailsForm = ({ initialValues, refCodes, refCodeOptions, onSubmit, isEditMode, isFetching }: RefCodeDetailsFormProps) => {
  const { t } = useTranslations()

  const existingCodes = refCodes.map(({ referenceCode }) => referenceCode)

  const validationSchema = useFormRefCodeValidation(isEditMode, existingCodes)

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  return (
    <Formik<RefCodeFormValues>
      component={(props) => <RefCodeDetailsFormLayout isEditMode={isEditMode} refCodeOptions={refCodeOptions} {...props} />}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnMount
    />
  )
}
