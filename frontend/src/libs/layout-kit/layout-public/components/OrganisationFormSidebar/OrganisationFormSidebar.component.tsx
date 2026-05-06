import { Formik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

import { FieldOrganisations } from 'libs/form-kit/components/FieldOrganisations/FieldOrganisations.component.tsx'
import {
  OrganisationFormSidebarStyled,
  OrganisationsFormStyled
} from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.styles.tsx'
import { OrganisationFormValues } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.types.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service'
import { PATHS } from 'routes'

interface OrganisationFormLayoutProps {
  isSidebarOpen: boolean
  items: { name: string; value: string }[]
  onOrgSelect: (orgId: string) => void
}

const OrganisationFormLayout = ({ isSidebarOpen, items, onOrgSelect }: OrganisationFormLayoutProps) => {
  return (
    <OrganisationsFormStyled noValidate>
      <FieldOrganisations items={items} hasChevron={isSidebarOpen} onSelect={onOrgSelect} />
    </OrganisationsFormStyled>
  )
}

interface OrganisationFormSidebarProps {
  initialValues: OrganisationFormValues
  onSubmit?: (values: OrganisationFormValues) => void
  isSidebarOpen: boolean
}

export const OrganisationFormSidebar = ({
  initialValues,
  onSubmit,
  isSidebarOpen
}: OrganisationFormSidebarProps) => {
  const navigate = useNavigate()
  const { organisations, isFetching } = useGetOrganisationsModel()

  const handleOrgSelect = useCallback(() => {
    // No-op: sidebar should not force navigation, only update context
  }, [])

  if (isFetching || !organisations) return null

  const organisationOptions = organisations.map((o: any) => ({
    name: o.name,
    value: o.id
  }))

  const defaultOrganisation = initialValues.organisations ?? ''

  return (
    <OrganisationFormSidebarStyled>
      <Formik<OrganisationFormValues>
        enableReinitialize
        initialValues={{
          ...initialValues,
          organisations: defaultOrganisation
        }}
        onSubmit={onSubmit ?? (() => undefined)}
        component={() => (
          <OrganisationFormLayout
            isSidebarOpen={isSidebarOpen}
            items={organisationOptions}
            onOrgSelect={handleOrgSelect}
          />
        )}
      />
    </OrganisationFormSidebarStyled>
  )
}