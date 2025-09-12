import { useField } from 'formik'

import { InputOrganisationsSelectField } from 'libs/form-kit/components/InputOrganisationsSelectField/InputOrganisationsSelectField.component.tsx'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component'

interface FieldOrganisationsProps {
  items: SelectOption[]
  hasChevron?: boolean
}

export const FieldOrganisations = ({ items, hasChevron }: FieldOrganisationsProps) => {
  const [field] = useField({ name: 'organisations' })

  return <InputOrganisationsSelectField id={field.name} items={items} name={field.name} value={field.value} onChange={field.onChange} hasChevron={hasChevron} />
}
