import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { Form, FormikProvider } from 'formik'
import { ArrowRight, Box2, FilterRemove } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { FieldText } from 'features/forms'
import { Divider } from 'features/mui/base'
import { useMediaQueries } from 'hooks'
import { OrganisationEntity } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types.ts'
import { FieldSelect } from 'libs/form-kit/components/FieldSelect/FieldSelect.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { Avatar } from 'libs/ui-kit/components/Avatar/Avatar.component.tsx'
import { getAvatarColor } from 'libs/ui-kit/components/Avatar/Avatar.consts.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { getInitials } from 'libs/utils/getInitials.ts'
import { getGridColumns } from 'modules/public-landing/utils/grid.ts'
import { getOrgPath } from 'routes'

import { ORGANISATIONS_PAGE_SIZE } from './LandingOrganisations.consts'
import { useLandingOrganisations, useLandingOrganisationsFilters } from './LandingOrganisations.hooks'
import {
  EmptyStateStyled,
  NoResultsStackStyled,
  NoResultsStyled,
  OrganisationCardStyled,
  OrganisationGridStyled,
  OrganisationRowStyled,
  PaginationStyled,
  RowOverlayStyled,
  SearchIconStyled,
  ToolbarStyled
} from './LandingOrganisations.styles'
import { OrganisationSort } from './LandingOrganisations.types'

interface LandingOrganisationsProps {
  organisations: OrganisationEntity[] | null
  isPending: boolean
  isError: boolean
  isCompact: boolean
}

const OrganisationIdentity = ({ name, lastUpdated, index }: { name: string; lastUpdated: string; index: number }) => {
  const { t } = useTranslations()

  return (
    <>
      <Avatar aria-hidden background={getAvatarColor(index)}>
        {getInitials(name)}
      </Avatar>
      <Box flex="1 1 auto" minWidth={0}>
        <Typography component="h3" variant="subtitle2" noWrap>
          {name}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {t({ id: 'landingLastUpdated' }, { date: dayjs(lastUpdated).format('DD/MM/YYYY') })}
        </Typography>
      </Box>
    </>
  )
}

const OrganisationCard = ({ id, name, lastUpdated, index }: { id: string; name: string; lastUpdated: string; index: number }) => {
  const theme = useTheme()

  return (
    <OrganisationCardStyled component={RouterLink} to={getOrgPath('reports', id)} viewTransition disableRipple>
      <OrganisationIdentity name={name} lastUpdated={lastUpdated} index={index} />
      <ArrowRight aria-hidden color={theme.palette.text.secondary} size={24} />
    </OrganisationCardStyled>
  )
}

export const LandingOrganisations = ({ organisations, isPending, isError, isCompact }: LandingOrganisationsProps) => {
  const { t } = useTranslations()
  const theme = useTheme()
  const { isMobile } = useMediaQueries()

  const pageSize = isMobile ? ORGANISATIONS_PAGE_SIZE.MOBILE : ORGANISATIONS_PAGE_SIZE.DESKTOP

  const { filters } = useLandingOrganisationsFilters()
  const { items, filteredCount, columns, visibleItems, currentPage, pageCount, handlePageChange } = useLandingOrganisations(organisations ?? [], filters.values, pageSize)

  if (!organisations && (isPending || isError)) {
    return (
      <NoResultsStackStyled>
        <OrganisationRowStyled aria-hidden sx={{ visibility: 'hidden' }}>
          <OrganisationIdentity name="Organisation" lastUpdated={dayjs().toISOString()} index={0} />
        </OrganisationRowStyled>
        <RowOverlayStyled>{isError ? <Alert severity="error">{t({ id: 'landingOrganisationsError' })}</Alert> : <LoaderCentered />}</RowOverlayStyled>
      </NoResultsStackStyled>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyStateStyled $isCompact={isCompact}>
        {!isCompact && <Box2 aria-hidden color={theme.palette.action.disabled} size={56} variant="Outline" />}
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="body2">{t({ id: 'landingOrganisationsEmptyTitle' })}</Typography>
          <Box>
            <Typography color="text.secondary" variant="body2">
              {t({ id: 'landingOrganisationsEmptyHint' })}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {t({ id: 'landingOrganisationsEmptyHintCheckBack' })}
            </Typography>
          </Box>
        </Box>
      </EmptyStateStyled>
    )
  }

  if (items.length === 1) {
    const [organisation] = items

    if (isMobile) {
      return <OrganisationCard id={organisation.id} name={organisation.name} lastUpdated={organisation.lastUpdated} index={0} />
    }

    return (
      <OrganisationRowStyled>
        <OrganisationIdentity name={organisation.name} lastUpdated={organisation.lastUpdated} index={0} />
        <ButtonPrimary
          component={RouterLink}
          to={getOrgPath('reports', organisation.id)}
          viewTransition
          aria-label={t({ id: 'landingViewPublishedDataOf' }, { name: organisation.name })}
          size="small"
        >
          {t({ id: 'landingViewPublishedData' })}
        </ButtonPrimary>
      </OrganisationRowStyled>
    )
  }

  const unfilteredPageCount = Math.ceil(items.length / pageSize)

  const sortItems = [
    { name: t({ id: 'landingSortLastUpdated' }), value: OrganisationSort.LAST_UPDATED },
    { name: t({ id: 'landingSortName' }), value: OrganisationSort.NAME }
  ]

  return (
    <FormikProvider value={filters}>
      <Box display="flex" flexDirection="column" gap={2}>
        <ToolbarStyled component={Form} role="search">
          <FieldText
            name="search"
            type="text"
            placeholder={t({ id: 'landingSearchOrganisations' })}
            slotProps={{ input: { startAdornment: <SearchIconStyled /> }, htmlInput: { 'aria-label': t({ id: 'landingSearchOrganisations' }) } }}
          />
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
          <FieldSelect name="sort" label="landingSortBy" items={sortItems} />
        </ToolbarStyled>
        <Typography color="text.secondary" variant="caption" role="status">
          {filteredCount === items.length
            ? t({ id: 'landingOrganisationsCount' }, { count: items.length })
            : t({ id: 'landingOrganisationsFilteredCount' }, { count: filteredCount, total: items.length })}
        </Typography>
        {filteredCount === 0 ? (
          <NoResultsStackStyled>
            <Box aria-hidden display="flex" flexDirection="column" gap={2} sx={{ visibility: 'hidden' }}>
              <OrganisationGridStyled $columns={getGridColumns(items.length)} $pageRows={unfilteredPageCount > 1 ? pageSize : null}>
                {items.slice(0, pageSize).map((organisation, index) => (
                  <li key={organisation.id}>
                    <OrganisationCard id={organisation.id} name={organisation.name} lastUpdated={organisation.lastUpdated} index={index} />
                  </li>
                ))}
              </OrganisationGridStyled>
              {unfilteredPageCount > 1 && (
                <Box display="flex" justifyContent="center">
                  <PaginationStyled
                    count={unfilteredPageCount}
                    shape="rounded"
                    siblingCount={isMobile ? 0 : 1}
                    hidePrevButton={unfilteredPageCount <= 3}
                    hideNextButton={unfilteredPageCount <= 3}
                  />
                </Box>
              )}
            </Box>
            <NoResultsStyled>
              <FilterRemove aria-hidden color={theme.palette.action.disabled} size={56} variant="Outline" />
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">{t({ id: 'landingNoResultsTitle' })}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t({ id: 'landingNoResultsHint' })}
                </Typography>
              </Box>
            </NoResultsStyled>
          </NoResultsStackStyled>
        ) : (
          <OrganisationGridStyled $columns={columns} $pageRows={pageCount > 1 ? pageSize : null}>
            {visibleItems.map((organisation) => (
              <li key={organisation.id}>
                <OrganisationCard id={organisation.id} name={organisation.name} lastUpdated={organisation.lastUpdated} index={items.indexOf(organisation)} />
              </li>
            ))}
          </OrganisationGridStyled>
        )}
        {pageCount > 1 && (
          <Box display="flex" justifyContent="center">
            <PaginationStyled
              aria-label={t({ id: 'landingOrganisationPages' })}
              count={pageCount}
              page={currentPage}
              onChange={(_, page) => handlePageChange(page)}
              getItemAriaLabel={(type, page) => {
                if (type === 'previous') return t({ id: 'landingGoToPreviousPage' })
                if (type === 'next') return t({ id: 'landingGoToNextPage' })
                return t({ id: 'landingGoToPage' }, { page })
              }}
              shape="rounded"
              siblingCount={isMobile ? 0 : 1}
              hidePrevButton={pageCount <= 3}
              hideNextButton={pageCount <= 3}
            />
          </Box>
        )}
      </Box>
    </FormikProvider>
  )
}
