import { Formik } from 'formik'

import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { FieldOrganisations } from 'libs/form-kit/components/FieldOrganisations/FieldOrganisations.component.tsx'
import { OrganisationFormSidebarStyled, OrganisationsFormStyled } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.styles.tsx'
import { OrganisationFormValues } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.types.ts'

interface OrganisationFormLayoutProps {
  isSidebarOpen: boolean
}

const OrganisationFormLayout = ({ isSidebarOpen }: OrganisationFormLayoutProps) => {
  const selectedOrganisation = useSelectedOrganisation()

  const organisationsOptions = [{ name: 'Cardano Foundation', value: selectedOrganisation }]

  return (
    <OrganisationsFormStyled noValidate>
      <FieldOrganisations items={organisationsOptions} hasChevron={isSidebarOpen} />
    </OrganisationsFormStyled>
  )
}

interface OrganisationFormSidebarProps {
  initialValues: OrganisationFormValues
  onSubmit: (values: OrganisationFormValues) => void
  isSidebarOpen: boolean
}

export const OrganisationFormSidebar = ({ initialValues, onSubmit, isSidebarOpen }: OrganisationFormSidebarProps) => {
  return (
    <OrganisationFormSidebarStyled>
      <Formik<OrganisationFormValues>
        component={() => <OrganisationFormLayout isSidebarOpen={isSidebarOpen} />}
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize
      />
    </OrganisationFormSidebarStyled>
  )
}
