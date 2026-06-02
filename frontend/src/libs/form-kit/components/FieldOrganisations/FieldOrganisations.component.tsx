import { useField } from 'formik'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { InputOrganisationsSelectField } from 'libs/form-kit/components/InputOrganisationsSelectField/InputOrganisationsSelectField.component.tsx'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component'
import { SelectChangeEvent } from '@mui/material/Select'

interface FieldOrganisationsProps {
  items: SelectOption[]
  hasChevron?: boolean
  onSelect?: (organisationId: string) => void
}

export const FieldOrganisations = ({ items, hasChevron, onSelect }: FieldOrganisationsProps) => {
  const [field] = useField({ name: 'organisations' })
  const { setSelectedOrganisation } = useLayoutPublicContext()

  const handleChange = (e: SelectChangeEvent<string>) => {
    field.onChange(e)
    const value = e.target.value
    if (value) {
      setSelectedOrganisation(value)
      onSelect?.(value)
    }
  }

  return <InputOrganisationsSelectField id={field.name} items={items} name={field.name} value={field.value} onChange={handleChange} hasChevron={hasChevron} />
}
