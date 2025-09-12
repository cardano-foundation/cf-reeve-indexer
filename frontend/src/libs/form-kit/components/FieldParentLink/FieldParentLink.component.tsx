import FormControlLabel from '@mui/material/FormControlLabel'
import { useField } from 'formik'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Checkbox } from 'libs/ui-kit/components/Checkbox/Checkbox.component.tsx'

interface FieldParentLinkProps {
  disabled?: boolean
}

export const FieldParentLink = ({ disabled }: FieldParentLinkProps) => {
  const [field] = useField<boolean>({ name: 'hasParent' })

  const { t } = useTranslations()

  return (
    <FormControlLabel
      control={<Checkbox id={field.name} name={field.name} checked={field.value} onBlur={field.onBlur} onChange={field.onChange} disabled={disabled} />}
      label={t({ id: 'parentLink' })}
    />
  )
}
