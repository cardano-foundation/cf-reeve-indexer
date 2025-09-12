import { DocumentUpload } from 'iconsax-react'
import { ChangeEvent, FocusEvent } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { InputFileStyled } from 'libs/ui-kit/components/InputFile/InputFile.styles.tsx'
import { UploadFileResults } from 'libs/ui-kit/components/UploadFileResults/UploadFileResults.component.tsx'

interface InputFileProps {
  accept?: string
  error?: string
  file: File | null
  label?: string
  name: string
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onClose: () => void
  isClearDisabled?: boolean
  isUploadDisabled?: boolean
}

export const InputFile = ({ accept, error, file, label, name, onBlur, onChange, onClose, isClearDisabled, isUploadDisabled }: InputFileProps) => {
  const { t } = useTranslations()

  return (
    <>
      <ButtonPrimary component="label" role={undefined} size="large" startIcon={<DocumentUpload size={20} variant="Outline" />} tabIndex={-1} disabled={isUploadDisabled} fullWidth>
        {label ?? t({ id: 'uploadFile' })}
        <InputFileStyled accept={accept} id={name} name={name} type="file" value="" onBlur={onBlur} onChange={onChange} />
      </ButtonPrimary>
      {file && <UploadFileResults error={error} file={file} onClose={onClose} isDisabled={isClearDisabled} />}
    </>
  )
}
