import { useField } from 'formik'

import { OrganisationsApiResponse } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { InputSelect } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

interface FieldOrganisationProps {
  organisations: OrganisationsApiResponse | null
  isDisabled?: boolean
}

export const FieldOrganisation = ({ organisations, isDisabled }: FieldOrganisationProps) => {
  const [field] = useField<string>('organisation')

  const { t } = useTranslations()

  const items = organisations?.map(({ id, name }) => ({ name, value: id })) ?? []

  return <InputSelect items={items} label={t({ id: 'organization' })} name={field.name} value={field.value} onChange={field.onChange} disabled={isDisabled} />
}
