import { Formik } from 'formik'

import { FieldOrganisations } from 'libs/form-kit/components/FieldOrganisations/FieldOrganisations.component.tsx'
import { OrganisationFormSidebarStyled, OrganisationsFormStyled } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.styles.tsx'
import { OrganisationFormValues } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.types.ts'

interface OrganisationFormLayoutProps {
  isSidebarOpen: boolean
}

const OrganisationFormLayout = ({ isSidebarOpen }: OrganisationFormLayoutProps) => {
  
  const CFOrganisationId = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'
  const ISOrganisationId = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca95'

  const organisationsOptions = [{ name: 'Cardano Foundation', value: CFOrganisationId }, { name: 'Issurance Swiss', value: ISOrganisationId }]

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
