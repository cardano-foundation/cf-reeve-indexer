import { useEffect } from 'react'
import { useField } from 'formik'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { InputOrganisationsSelectField } from 'libs/form-kit/components/InputOrganisationsSelectField/InputOrganisationsSelectField.component.tsx'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component'

interface FieldOrganisationsProps {
  items: SelectOption[]
  hasChevron?: boolean
  onSelect?: (organisationId: string) => void
}

export const FieldOrganisations = ({ items, hasChevron, onSelect }: FieldOrganisationsProps) => {
  const [field] = useField({ name: 'organisations' })
  const { setSelectedOrganisation } = useLayoutPublicContext()

  useEffect(() => {
    if (field.value) {
      setSelectedOrganisation(field.value)
      onSelect?.(field.value)
    }
  }, [field.value, setSelectedOrganisation, onSelect])

  return <InputOrganisationsSelectField id={field.name} items={items} name={field.name} value={field.value} onChange={field.onChange} hasChevron={hasChevron} />
}
