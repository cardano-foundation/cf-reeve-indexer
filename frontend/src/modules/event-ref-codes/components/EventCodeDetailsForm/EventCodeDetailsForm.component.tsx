import Grid from '@mui/material/Grid'
import { Form, Formik, FormikConfig, FormikProps } from 'formik'
import { useEffect } from 'react'

import { GetEventCodesResponse200 } from 'libs/api-connectors/backend-connector-lob/api/event-codes/eventCodesApi.types.ts'
import { FieldDescription } from 'libs/form-kit/components/FieldDescription/FieldDescription.component.tsx'
import { FieldEventCode } from 'libs/form-kit/components/FieldEventCode/FieldEventCode.component.tsx'
import { FieldSelect } from 'libs/form-kit/components/FieldSelect/FieldSelect.component.tsx'
import { useFormEventCodeValidation } from 'libs/form-kit/validations/useFormEventCodeValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { EventCodeFormValues } from 'modules/event-ref-codes/components/EventCodeDetailsForm/EventCodeDetailsForm.types.ts'

interface EditEventCodeFormLayoutProps extends FormikProps<EventCodeFormValues> {
  refCodeOptions: SelectOption[]
  isEditMode: boolean
}

export const EditEventCodeFormLayout = ({ values, refCodeOptions, setFieldTouched, setFieldValue, isEditMode }: EditEventCodeFormLayoutProps) => {
  useEffect(() => {
    if (values.debitReferenceCode || values.creditReferenceCode) {
      const value = `${values.debitReferenceCode}${values.creditReferenceCode}`

      setFieldValue('eventCode', value)
    }

    if (values.debitReferenceCode && values.creditReferenceCode) {
      setFieldTouched('eventCode', true, true)
    }
  }, [values.debitReferenceCode, values.creditReferenceCode, setFieldTouched, setFieldValue])

  return (
    <Form id="event-codes-form">
      <Grid container spacing={3}>
        <Grid size={12}>
          <FieldDescription />
        </Grid>
        <Grid container size={12}>
          <Grid size={{ xs: 12, sm: 'grow' }}>
            <FieldSelect label="debitReferenceCode" name="debitReferenceCode" items={refCodeOptions} required disabled={isEditMode} />
          </Grid>
          <Grid size={{ xs: 12, sm: 'grow' }}>
            <FieldSelect label="creditReferenceCode" name="creditReferenceCode" items={refCodeOptions} required disabled={isEditMode} />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FieldEventCode disabled />
        </Grid>
      </Grid>
    </Form>
  )
}

interface EventCodeDetailsFormProps {
  eventCodes: GetEventCodesResponse200
  initialValues: EventCodeFormValues
  refCodeOptions: SelectOption[]
  onSubmit: FormikConfig<EventCodeFormValues>['onSubmit']
  isEditMode: boolean
  isFetching: boolean
}

export const EventCodeDetailsForm = ({ eventCodes, initialValues, refCodeOptions, onSubmit, isEditMode, isFetching }: EventCodeDetailsFormProps) => {
  const { t } = useTranslations()

  const existingCodes = eventCodes.map(({ customerCode }) => customerCode)

  const validationSchema = useFormEventCodeValidation(isEditMode, existingCodes)

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  return (
    <Formik<EventCodeFormValues>
      component={(props) => <EditEventCodeFormLayout {...props} isEditMode={isEditMode} refCodeOptions={refCodeOptions} />}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnMount
    />
  )
}
