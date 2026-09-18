import { Formik } from 'formik'
import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { useMediaQueries } from 'hooks'
import { FieldOrganisations } from 'libs/form-kit/components/FieldOrganisations/FieldOrganisations.component.tsx'
import { OrganisationFormSidebarStyled, OrganisationsFormStyled } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.styles.tsx'
import { OrganisationFormValues } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.types.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service'
import { getOrgPath } from 'routes'

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

export const OrganisationFormSidebar = ({ initialValues, onSubmit, isSidebarOpen }: OrganisationFormSidebarProps) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { organisations } = useGetOrganisationsModel()
  const { isMobile } = useMediaQueries()

  const handleOrgSelect = useCallback(
    (orgId: string) => {
      // Determine current route type (reports, transactions, or projects)
      const isReports = pathname.includes('/reports')
      const isTransactions = pathname.includes('/transactions')
      const isProjects = pathname.includes('/projects')

      if (isReports) {
        navigate(getOrgPath('reports', orgId))
      } else if (isTransactions) {
        navigate(getOrgPath('transactions', orgId))
      } else if (isProjects) {
        navigate(getOrgPath('projects', orgId))
      } else {
        // Default to reports if no specific route detected
        navigate(getOrgPath('reports', orgId))
      }
    },
    [pathname, navigate]
  )

  const organisationOptions = (organisations ?? []).map((o: any) => ({
    name: o.name,
    value: o.id
  }))

  const defaultOrganisation = initialValues.organisations ?? ''

  return (
    <OrganisationFormSidebarStyled $isMobile={isMobile}>
      <Formik<OrganisationFormValues>
        enableReinitialize
        initialValues={{
          ...initialValues,
          organisations: defaultOrganisation
        }}
        onSubmit={onSubmit ?? (() => undefined)}
      >
        {() => <OrganisationFormLayout isSidebarOpen={isSidebarOpen} items={organisationOptions} onOrgSelect={handleOrgSelect} />}
      </Formik>
    </OrganisationFormSidebarStyled>
  )
}
