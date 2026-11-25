import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { Copy, DocumentDownload, ExportSquare, TickCircle } from 'iconsax-react'
import { useState } from 'react'

import { Modal } from 'features/common'
import { ICONSAX_NAMES, IconsaxIcon } from 'features/iconsax'
import { Grid, Divider, IconButton } from 'features/mui/base'
import { NestedMap } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { truncateHash } from 'libs/documents-kit/utils/format.ts'
import { getLegalName, useGLEIFVerification } from 'libs/hooks/useGLEIFVerification'
import { useSelectedOrganisationName } from 'libs/layout-kit/layout-public/hooks/useSelectedOrganisationName.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { Snackbar, SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format'
import { EXPLORER_TX_URL } from 'modules/public-events-auditor/utils/explorer.ts'
import { ChipAccountingRegime } from 'modules/public-reports/components/ChipAccountingRegime/ChipAccountingRegime.component.tsx'
import { DetailRow } from 'modules/public-reports/components/DetailRow/DetailRow.component.tsx'
import { useAttestationKinds } from 'modules/public-reports/hooks/useAttestationKinds.ts'
import { formatCurrency, snakeToNormal } from 'modules/public-reports/utils/format'
import { getReportPeriod } from 'modules/public-reports/utils/payload'

import { useModalReportCopyLink, useModalReportDownload } from './modal-report.hooks'
import { getLegacyReportConfig } from './modal-report.legacy-configs'
import { ActionsStyled, ContentStyled } from './modal-report.styles'
import type { ModalReportProps, ReportDetailRow, ReportDetailsProps } from './modal-report.types'
import { computeNestedSum } from './modal-report.utils'

const createSafeT = (t: any) => (id?: string, variables?: Record<string, any>, fallback?: string) => {
  if (!id) return fallback || ''
  return t({ id, defaultMessage: fallback || snakeToNormal(id) }, variables)
}

const LEVEL_SX: Record<number, object> = {
  0: { textTransform: 'uppercase' },
  1: { textTransform: 'uppercase' },
  2: { textDecoration: 'underline' },
  3: {},
  4: { fontStyle: 'italic' }
}

const getLevelSx = (depth: number) => LEVEL_SX[Math.min(depth, 4)]

export const ModalReport = ({ report, onClose, isOpen }: ModalReportProps) => {
  const { t } = useTranslations()
  const safeT = createSafeT(t)

  const { txHash, currency, period, intervalType, year, data, subType, accountingRegime } = report

  const { isDownloadPending, handleDownload, isSnackbarVisible, handleSnackbarClose } = useModalReportDownload(report)
  const { copyState, handleCopyLink } = useModalReportCopyLink(report)

  const titleText = safeT(
    'reportViewTitle',
    {
      currency: formatCurrency(currency),
      period: getReportPeriod(intervalType, period, year),
      type: safeT(subType)
    },
    'Report for {currency} - {period} ({type})'
  )

  return (
    <Modal aria-labelledby="modal-report-title" onClose={onClose} isOpen={isOpen}>
      <Modal.Header id="modal-report-title" hasCloseButton>
        {safeT('reportDialogPreviewTitle', {}, 'Preview Report')}
      </Modal.Header>
      <Modal.Content>
        <ContentStyled container direction="column" spacing={2}>
          <Grid container justifyContent="space-between" size={12} spacing={3}>
            <Grid alignItems="center" container size="auto" spacing={2}>
              <Typography id="modal-report-title" color="textPrimary" component="h5" variant="h3">
                {titleText}
              </Typography>
            </Grid>
            <Grid alignItems="center" container size="auto">
              <ChipAccountingRegime accountingRegime={accountingRegime} />
            </Grid>
          </Grid>
          <ReportDetails report={report} />
          <Divider flexItem />
          <NestedGrid data={data} depth={0} safeT={safeT} reportHash={txHash} reportType={subType} />
        </ContentStyled>
      </Modal.Content>
      <ActionsStyled>
        <ButtonSecondary
          startIcon={copyState === 'copied' ? <TickCircle size={20} variant="Outline" /> : <Copy size={20} variant="Outline" />}
          onClick={() => void handleCopyLink()}
        >
          {copyState === 'copied' ? t({ id: 'copied' }) : copyState === 'failed' ? t({ id: 'copyFailed' }) : t({ id: 'reportCopyLink' })}
        </ButtonSecondary>
        <ButtonSecondary aria-disabled={isDownloadPending} startIcon={<DocumentDownload size={20} variant="Outline" />} onClick={isDownloadPending ? undefined : handleDownload}>
          {t({ id: 'reportDownloadCsv' })}
        </ButtonSecondary>
      </ActionsStyled>
      <Snackbar open={isSnackbarVisible} message={t({ id: 'publicTransactionsExportError' })} type={SnackbarType.ERROR} onClose={handleSnackbarClose} />
    </Modal>
  )
}

const ReportDetails = ({ report }: ReportDetailsProps) => {
  const { t } = useTranslations()
  const organisationName = useSelectedOrganisationName()

  const { identities, isLoading } = useAttestationKinds(report.identities)
  const [publisher] = identities.organisation
  const [auditor] = identities.auditor

  const { data: auditorGleif } = useGLEIFVerification(auditor?.lei)
  const auditorName = getLegalName(auditorGleif)

  const isPublisherVerified = Boolean(publisher?.identityVerified)
  const isAuditorVerified = Boolean(auditor?.identityVerified)

  const identityId = isLoading
    ? 'verifyingLEI'
    : isPublisherVerified && isAuditorVerified
      ? 'reportIdentityBothVerified'
      : isPublisherVerified
        ? 'reportIdentityPublisherVerified'
        : isAuditorVerified
          ? 'reportIdentityAuditorVerified'
          : 'attestationPending'

  const audited = isLoading
    ? t({ id: 'verifyingLEI' })
    : !auditor
      ? t({ id: 'attestationPending' })
      : t({ id: 'reportDateBy' }, { date: auditor.blockTime ? dayjs.unix(auditor.blockTime).format('DD/MM/YYYY') : '-', name: auditorName || auditor.schemaName })

  const rows: ReportDetailRow[] = [
    {
      label: t({ id: 'published' }),
      value: t({ id: 'reportDateBy' }, { date: report.blockTime ? dayjs.unix(report.blockTime).format('DD/MM/YYYY') : '-', name: organisationName })
    },
    { label: t({ id: 'reportAudited' }), value: audited },
    { label: t({ id: 'reportIdentity' }), value: t({ id: identityId }) },
    {
      label: t({ id: 'onChainRecord' }),
      value: report.txHash ? (
        <Tooltip title={report.txHash}>
          <span>{truncateHash(report.txHash, 4, 4)}</span>
        </Tooltip>
      ) : (
        t({ id: 'none' })
      ),
      actions: report.txHash && (
        <Tooltip title={t({ id: 'openInExplorer' })}>
          <Link
            aria-label={t({ id: 'openInExplorer' })}
            color="inherit"
            display="flex"
            href={`${EXPLORER_TX_URL}${encodeURIComponent(report.txHash)}`}
            rel="noreferrer"
            target="_blank"
          >
            <ExportSquare size={20} variant="Outline" />
          </Link>
        </Tooltip>
      )
    }
  ]

  return (
    <Stack spacing={1} width="100%">
      {rows.map(({ label, value, actions }) => (
        <DetailRow key={label} label={label} actions={actions}>
          <Typography color="text.primary" variant="body1">
            {value}
          </Typography>
        </DetailRow>
      ))}
    </Stack>
  )
}

interface NestedGridProps {
  data: NestedMap
  depth?: number
  safeT: (id?: string, variables?: Record<string, any>, fallback?: string) => string
  reportHash?: string
  reportType?: string
}

const NestedGrid: React.FC<NestedGridProps> = ({ data, depth = 0, safeT, reportHash, reportType }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const borderSX =
    depth > 1
      ? {
        borderLeft: '1px solid',
        borderColor: 'divider',
        pl: 2,
        ml: depth === 2 ? 1 : 0
      }
      : {}

  const camelize = (s: string) =>
    s
      .split(/_|(?=[A-Z])/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')

  const getLabel = (key: string) => safeT(key, {}, snakeToNormal(key))
  const getTotalLabel = (key: string, label: string) => safeT(`total${camelize(key)}`, {}, `Total ${label.toLowerCase()}`)

  // For known legacy income statement formats: apply explicit field ordering and
  // cumulative totals, where the grand-total section sums all previous sections.
  const legacyConfig = depth === 0 && reportHash != null ? getLegacyReportConfig(reportHash) : undefined

  // Apply cumulative totals for IncomeStatement reports at top level
  const isIncomeStatement = reportType === 'INCOME_STATEMENT'
  const shouldApplyCumulativeTotals = depth === 0 && (legacyConfig?.cumulativeSections || legacyConfig?.grandTotalField || isIncomeStatement)

  const entries = legacyConfig
    ? Object.entries(data).sort(([a], [b]) => {
      const ai = legacyConfig.fieldOrder.indexOf(a)
      const bi = legacyConfig.fieldOrder.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b)
      if (ai === -1) return -1
      if (bi === -1) return 1
      return ai - bi
    })
    : Object.entries(data)
  const cumulativeTotals = new Map<string, number>()
  if (shouldApplyCumulativeTotals) {
    let running = 0
    entries.forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        running += computeNestedSum(value as NestedMap)
        cumulativeTotals.set(key, running)
      }
    })
  }

  return (
    <Grid container direction="column" spacing={2} sx={borderSX}>
      {entries.map(([key, value]) => {
        const isNested = typeof value === 'object' && value !== null
        const label = getLabel(key)

        if (isNested) {
          const subtotal = cumulativeTotals.has(key) ? cumulativeTotals.get(key)! : computeNestedSum(value as NestedMap)
          const totalLabel = getTotalLabel(key, label)
          const isCollapsible = depth === 1
          const isOpen = !collapsed[key]
          const totalSx = depth === 0 ? { textDecoration: 'underline', textDecorationStyle: 'double' } : isCollapsible ? { textDecoration: 'underline' } : undefined
          const total = (
            <Grid display="flex" justifyContent="flex-end" maxWidth={{ xs: '100%', sm: '10rem' }} size="grow">
              <Typography color={'text.primary'} component="span" variant="h3" sx={totalSx}>
                {formatNumber(subtotal)}
              </Typography>
            </Grid>
          )
          return (
            <Grid key={`nested-${key}`} container direction="column" spacing={2} sx={depth === 0 ? { mb: 4, '&:last-of-type': { mb: 0 } } : undefined}>
              <Grid alignItems="center" container size="grow" spacing={{ xs: 1, sm: 3 }}>
                <Grid alignItems="center" container size={{ xs: 12, sm: 'grow' }} spacing={1} wrap="nowrap">
                  {isCollapsible && (
                    <IconButton
                      aria-label={safeT(isOpen ? 'collapseSubsection' : 'expandSubsection', { title: label })}
                      size="small"
                      sx={{ padding: '9px', marginLeft: '-9px' }}
                      onClick={() => setCollapsed({ ...collapsed, [key]: isOpen })}
                    >
                      <IconsaxIcon name={isOpen ? ICONSAX_NAMES.ARROW_UP2 : ICONSAX_NAMES.ARROW_DOWN2} size={16} variant="Outline" />
                    </IconButton>
                  )}
                  <Typography color="textPrimary" component="span" variant="h3" sx={getLevelSx(depth)}>
                    {label}
                  </Typography>
                </Grid>
                {!isOpen && total}
              </Grid>

              {isOpen && (
                <>
                  <NestedGrid data={value as NestedMap} depth={depth + 1} safeT={safeT} reportHash={reportHash} reportType={reportType} />

                  <Grid alignItems="center" container size="grow" spacing={{ xs: 1, sm: 3 }}>
                    <Grid container size={{ xs: 12, sm: 'grow' }}>
                      <Typography color="textPrimary" component="span" variant="h3" sx={getLevelSx(depth)}>
                        {totalLabel}
                      </Typography>
                    </Grid>
                    {total}
                  </Grid>
                </>
              )}
            </Grid>
          )
        }

        return (
          <Grid key={`item-${key}`} alignItems="center" container size="grow" spacing={{ xs: 1, sm: 3 }}>
            <Grid container size={{ xs: 12, sm: 'grow' }}>
              <Typography component="span">{label}</Typography>
            </Grid>
            <Grid display="flex" justifyContent="flex-end" maxWidth={{ xs: '100%', sm: '10rem' }} size="grow">
              <Typography color={'text.primary'} component="span" variant="body1">
                {formatNumber(Number.parseFloat(value as string))}
              </Typography>
            </Grid>
          </Grid>
        )
      })}
    </Grid>
  )
}
