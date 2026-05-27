import { Formik } from 'formik'
import Box from '@mui/material/Box'
import { Form } from 'formik'
import { styled } from 'styled-components'
import { useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { FieldOrganisations } from 'libs/form-kit/components/FieldOrganisations/FieldOrganisations.component.tsx'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useGetOrganisationsModel } from 'libs/models/organisation-model/GetOrganisations/GetOrganisations.service'
import { OrganisationFormValues } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.types.ts'
import { PATHS } from 'routes'

const OrganisationFormLandingStyled = styled(Box)`
  && {
    display: flex;
    width: 100%;
    padding: ${({ theme }) => theme.spacing(2, 0, 2, 0)};
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }
`

const OrganisationFormStyled = styled(Form)`
  && {
    width: 100%;
    max-width: 400px;
  }
`

export const ViewPublicLanding = () => {
  const { t } = useTranslations()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { selectedOrganisation, setSelectedOrganisation } = useLayoutPublicContext()
  const { organisations, isFetching } = useGetOrganisationsModel()

  const handleOrgSelect = useCallback((orgId: string) => {
    navigate(`/reports/${orgId}`)
  }, [navigate])

  useEffect(() => {
    const orgId = searchParams.get('organisation_id')
    if (orgId && organisations?.length > 0) {
      const organisationExists = organisations.some((o: any) => o.id === orgId)
      if (organisationExists) {
        setSelectedOrganisation(orgId)
        navigate(PATHS.PUBLIC_REPORTS, { replace: true })
      }
    }
  }, [searchParams, organisations, setSelectedOrganisation, navigate])

  if (isFetching || !organisations) {
    return (
      <>
        <LayoutPublic.Header>
          <LayoutPublic.Header.Details description={t({ id: 'welcome' })} title={t({ id: 'reeveIndexer' })} />
        </LayoutPublic.Header>
        <LayoutPublic.Main flexDirection="column" gap={6} isHeightRestricted>
          <EmptyStatePage
            message={t({ id: 'selectOrganisationMessage' })}
            hint={t({ id: 'selectOrganisationHint' })}
          />
        </LayoutPublic.Main>
      </>
    )
  }

  const organisationOptions = organisations.map((o: any) => ({
    name: o.name,
    value: o.id
  }))

  const initialValues: OrganisationFormValues = {
    organisations: selectedOrganisation ?? ''
  }

  return (
    <>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={t({ id: 'welcome' })} title={t({ id: 'reeveIndexer' })} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={6} isHeightRestricted>
        <OrganisationFormLandingStyled>
          <Formik<OrganisationFormValues>
            enableReinitialize
            initialValues={initialValues}
            onSubmit={() => undefined}
            component={() => (
              <OrganisationFormStyled noValidate>
                <FieldOrganisations items={organisationOptions} onSelect={handleOrgSelect} />
              </OrganisationFormStyled>
            )}
          />
        </OrganisationFormLandingStyled>
        <EmptyStatePage
          message={t({ id: 'selectOrganisationMessage' })}
          hint={t({ id: 'selectOrganisationHint' })}
        />
      </LayoutPublic.Main>
    </>
  )
}
