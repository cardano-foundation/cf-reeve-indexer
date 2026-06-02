import { Formik } from 'formik'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCallback } from 'react'

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
  const { pathname } = useLocation()
  const { organisations, isFetching } = useGetOrganisationsModel()

  const handleOrgSelect = useCallback((orgId: string) => {
    const isTransactions = pathname.includes('/transactions')
    const targetPath = isTransactions ? `/transactions/${orgId}` : `/reports/${orgId}`

    if (pathname !== targetPath) {
      navigate(targetPath)
    }
  }, [pathname, navigate])

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
        onSubmit={onSubmit ?? (() => undefined)}>
        {() => (
          <OrganisationFormLayout
            isSidebarOpen={isSidebarOpen}
            items={organisationOptions}
            onOrgSelect={handleOrgSelect}
          />
        )}
      </Formik>
    </OrganisationFormSidebarStyled>
  )
}
