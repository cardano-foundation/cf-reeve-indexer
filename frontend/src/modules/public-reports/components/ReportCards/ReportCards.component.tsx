import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { Box2, FilterRemove } from 'iconsax-react'
import { useEffect, useRef } from 'react'

import { useSelectedOrganisationName } from 'libs/layout-kit/layout-public/hooks/useSelectedOrganisationName.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { EmptyStateTable } from 'libs/ui-kit/components/EmptyStateTable/EmptyStateTable.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { ChipAccountingRegime } from 'modules/public-reports/components/ChipAccountingRegime/ChipAccountingRegime.component.tsx'
import { ReportAttestations } from 'modules/public-reports/components/ReportAttestations/ReportAttestations.component.tsx'
import { formatCurrency } from 'modules/public-reports/utils/format.ts'
import { getReportPeriod } from 'modules/public-reports/utils/payload.ts'

import { ReportCardActionStyled, ReportCardAttestationsStyled, ReportCardListStyled, ReportCardStyled } from './ReportCards.styles'
import type { ReportCardsProps } from './ReportCards.types'

export const ReportCards = ({ data, hasFiltersSelected, isFetching, isAttestationsLoading, onViewOpen, onAttestationSelect, onLoadMore }: ReportCardsProps) => {
  const { t } = useTranslations()
  const organisationName = useSelectedOrganisationName()

  const theme = useTheme()

  const listRef = useRef<HTMLUListElement>(null)
  const loadMoreRef = useRef<HTMLButtonElement>(null)
  const focusIndexRef = useRef<number | null>(null)

  const reports = data?.reports ?? []
  const total = data?.total ?? 0

  useEffect(() => {
    if (isFetching || focusIndexRef.current === null) return

    const focusIndex = focusIndexRef.current
    focusIndexRef.current = null

    const isFocusOnLoadMore = document.activeElement === loadMoreRef.current || document.activeElement === document.body

    if (!isFocusOnLoadMore || reports.length <= focusIndex) return

    listRef.current?.querySelectorAll<HTMLElement>('.MuiCardActionArea-root')[focusIndex]?.focus()
  }, [isFetching, reports.length])

  const handleLoadMore = () => {
    focusIndexRef.current = reports.length
    onLoadMore()
  }

  if (isFetching && !reports.length) {
    return (
      <Box py={6}>
        <EmptyStateTable asset={<LoaderCentered size={56} />} hint={t({ id: 'loadingHint' })} message={t({ id: 'loadingMessage' })} />
      </Box>
    )
  }

  if (!reports.length) {
    return (
      <Box py={6}>
        {hasFiltersSelected ? (
          <EmptyStateTable
            asset={<FilterRemove color={theme.palette.action.disabled} size={56} variant="Outline" />}
            hint={t({ id: 'noResultsHint' })}
            message={t({ id: 'noResultsMessage' })}
          />
        ) : (
          <EmptyStateTable
            asset={<Box2 color={theme.palette.action.disabled} size={56} variant="Outline" />}
            hint={t({ id: 'noPublicReportsHint' }, { organisation: organisationName })}
            message={t({ id: 'nothingHereMessage' })}
          />
        )}
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <ReportCardListStyled ref={listRef} aria-busy={isFetching} component="ul">
        {reports.map((report) => {
          const reportName = t({ id: report.subType })
          const reportPeriod = getReportPeriod(report.intervalType, report.period, report.year)

          return (
            <ReportCardStyled
              key={`${report.organisationId}-${report.subType}-${report.intervalType}-${report.year}-${report.period}-${report.ver}-${report.txHash}`}
              component="li"
            >
              <Box alignItems="center" display="flex" gap={2} justifyContent="space-between">
                <ReportCardActionStyled aria-haspopup="dialog" aria-label={`${reportName}, ${reportPeriod}`} onClick={() => onViewOpen(report)}>
                  <Typography component="span" variant="subtitle2">
                    {reportName}
                  </Typography>
                </ReportCardActionStyled>
                <Box alignItems="center" display="flex" flex="none" height={0}>
                  <ChipAccountingRegime accountingRegime={report.accountingRegime} />
                </Box>
              </Box>
              <Box alignItems="center" display="flex" flexWrap="wrap" gap={1}>
                <Typography color="text.secondary" variant="body2">
                  {reportPeriod}
                </Typography>
                <Typography aria-hidden color="text.secondary" variant="body2">
                  |
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {formatCurrency(report.currency)}
                </Typography>
              </Box>
              {!!report.blockTime && (
                <Typography color="text.secondary" variant="body2">
                  {t({ id: 'reportPublishedOn' }, { date: dayjs.unix(report.blockTime).format('DD/MM/YYYY') })}
                </Typography>
              )}
              <ReportCardAttestationsStyled>
                <ReportAttestations report={report} isLoading={isAttestationsLoading} onSelect={(kind) => onAttestationSelect(report, kind)} />
              </ReportCardAttestationsStyled>
            </ReportCardStyled>
          )
        })}
      </ReportCardListStyled>
      <Box alignItems="center" display="flex" flexDirection="column" gap={1}>
        <Typography color="text.secondary" role="status" variant="body2">
          {t({ id: 'reportsLoadedCount' }, { count: reports.length, total })}
        </Typography>
        {reports.length < total && (
          <ButtonSecondary ref={loadMoreRef} loading={isFetching} onClick={handleLoadMore} fullWidth>
            {t({ id: 'loadMore' })}
          </ButtonSecondary>
        )}
      </Box>
    </Box>
  )
}
