import { SelectChangeEvent } from '@mui/material/Select'
import { useField } from 'formik'

import { InputOrganisationsSelectField } from 'libs/form-kit/components/InputOrganisationsSelectField/InputOrganisationsSelectField.component.tsx'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component'

interface FieldOrganisationsProps {
  items: SelectOption[]
  isCollapsed?: boolean
  onSelect?: (organisationId: string) => void
}

export const FieldOrganisations = ({ items, isCollapsed, onSelect }: FieldOrganisationsProps) => {
  const [field] = useField({ name: 'organisations' })
  const { setSelectedOrganisation } = useLayoutPublicContext()
  const { t } = useTranslations()

  const handleChange = (e: SelectChangeEvent<string>) => {
    field.onChange(e)
    const value = e.target.value
    if (value) {
      setSelectedOrganisation(value)
      onSelect?.(value)
    }
  }

  return <InputOrganisationsSelectField id={field.name} items={items} name={field.name} value={field.value} onChange={handleChange} isCollapsed={isCollapsed} placeholder={t({ id: 'selectOrganisation' })} />
}
