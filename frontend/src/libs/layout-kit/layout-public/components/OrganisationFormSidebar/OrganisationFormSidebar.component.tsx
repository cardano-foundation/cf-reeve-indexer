import { Formik } from 'formik'

import { FieldOrganisations } from 'libs/form-kit/components/FieldOrganisations/FieldOrganisations.component.tsx'
import {
  OrganisationFormSidebarStyled,
  OrganisationsFormStyled
} from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.styles.tsx'
import { OrganisationFormValues } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.types.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service'

interface OrganisationFormLayoutProps {
  isSidebarOpen: boolean
  items: { name: string; value: string }[]
}

const OrganisationFormLayout = ({ isSidebarOpen, items }: OrganisationFormLayoutProps) => {
  return (
    <OrganisationsFormStyled noValidate>
      <FieldOrganisations items={items} hasChevron={isSidebarOpen} />
    </OrganisationsFormStyled>
  )
}

interface OrganisationFormSidebarProps {
  initialValues: OrganisationFormValues
  onSubmit: (values: OrganisationFormValues) => void
  isSidebarOpen: boolean
}

export const OrganisationFormSidebar = ({
  initialValues,
  onSubmit,
  isSidebarOpen
}: OrganisationFormSidebarProps) => {

  const { organisations, isFetching } = useGetOrganisationsModel()

  if (isFetching || !organisations) return null

  const organisationOptions = organisations.map((o: any) => ({
    name: o.name,
    value: o.id
  }))

  const defaultOrganisation = initialValues.organisations || organisationOptions[0]?.value

  return (
    <OrganisationFormSidebarStyled>
      <Formik<OrganisationFormValues>
        enableReinitialize
        initialValues={{
          ...initialValues,
          organisations: defaultOrganisation
        }}
        onSubmit={onSubmit}
        component={() => (
          <OrganisationFormLayout
            isSidebarOpen={isSidebarOpen}
            items={organisationOptions}
          />
        )}
      />
    </OrganisationFormSidebarStyled>
  )
}