import { useField } from 'formik'
import { ChangeEvent } from 'react'

import { InputFile } from 'libs/ui-kit/components/InputFile/InputFile.component.tsx'

interface FieldUploadFileProps {
  isClearDisabled?: boolean
  isUploadDisabled?: boolean
}

export const FieldUploadFile = ({ isClearDisabled = false, isUploadDisabled = false }: FieldUploadFileProps) => {
  const [field, meta, helpers] = useField<File | null>('file')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files ? event.currentTarget.files[0] : null

    field.onChange({ target: { name: field.name, value: file } })
  }

  return (
    <InputFile
      accept="text/csv"
      error={meta.error}
      file={field.value}
      name={field.name}
      onBlur={field.onBlur}
      onChange={handleChange}
      onClose={() => helpers.setValue(null)}
      isClearDisabled={isClearDisabled}
      isUploadDisabled={isUploadDisabled || Boolean(field.value)}
    />
  )
}
