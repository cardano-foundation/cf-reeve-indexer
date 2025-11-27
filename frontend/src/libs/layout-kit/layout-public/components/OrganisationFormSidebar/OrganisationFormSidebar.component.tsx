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

<<<<<<< HEAD
const OrganisationFormLayout = ({ isSidebarOpen, items }: OrganisationFormLayoutProps) => {
=======
const OrganisationFormLayout = ({ isSidebarOpen }: OrganisationFormLayoutProps) => {
  const CFOrganisationId = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'
  const ISOrganisationId = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca95'

  const organisationsOptions = [
    { name: 'Cardano Foundation', value: CFOrganisationId },
    { name: 'Issuance Swiss', value: ISOrganisationId }
  ]

>>>>>>> main
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