import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useQueryClient } from '@tanstack/react-query'
import { FormikProvider } from 'formik'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { ButtonPrimary, ButtonSecondary } from 'features/common'
import { BatchDetailsFilters } from 'features/ui'
import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { ChipGroup } from 'libs/layout-kit/components/ChipGroup/ChipGroup.component.tsx'
import { useLayoutAuthContext } from 'libs/layout-kit/layout-auth/hooks/useLayoutAuthContext.ts'
import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useGetBatchModel } from 'libs/models/batches-model/GetBatch/GetBatch.service.ts'
import { useReprocessBatchModel } from 'libs/models/batches-model/ReprocessBatch/ReprocessBatch.service.ts'
import { useApproveTransactionsModel } from 'libs/models/transactions-model/ApproveTransactions/ApproveTransactions.service.ts'
import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ChipImportDetails } from 'libs/ui-kit/components/ChipImportDetails/ChipImportDetails.component.tsx'
import { ChipTransactionsCount } from 'libs/ui-kit/components/ChipTransactionsCount/ChipTransactionsCount.component.tsx'
import { ModalAction } from 'libs/ui-kit/components/ModalAction/ModalAction.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { SnackbarActionType, useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { useBatchContext } from 'modules/review/components/BatchContext/hooks/useBatchContext.tsx'
import { BatchDetailsContextProvider } from 'modules/review/components/BatchDetailsContext/BatchDetailsContext.component.tsx'
import { TabsBatchesReview } from 'modules/review/components/TabsBatchesReview/TabsBatchesReview.component.tsx'
import { useTransactionsContext } from 'modules/review/components/TransactionsContext/hooks/useTransactionsContext.tsx'
import { useTransactionsReprocessContext } from 'modules/review/components/TransactionsReprocessContext/hooks/useTransactionsReprocessContext.tsx'
import { useBatchDetails } from 'modules/review/hooks/useBatchDetails.ts'
import { SectionBatchesReview } from 'modules/review/sections/SectionBatchesReview/SectionBatchesReview.component.tsx'

export const ViewBatchesReview = () => {
  const queryClient = useQueryClient()

  const { redirect, selectedBatchId, selectedBatchStat, setSelectedBatchId, setSelectedBatchStat } = useBatchContext()
  const { selectedTransactions, setSelectedTransactions } = useTransactionsContext()
  const { isReprocessing, showSnackbar: showSnackbarReprocess, setIsReprocessing, setHint, setMessage } = useTransactionsReprocessContext()
  const selectedOrganisation = useSelectedOrganisation()

  const navigate = useNavigate()

  const { t } = useTranslations()

  const { batch } = useGetBatchModel(
    {
      parameters: {
        batchId: selectedBatchId,
        page: 0,
        size: 1,
        sort: [],
        status: [BatchStatistics.APPROVE, BatchStatistics.INVALID, BatchStatistics.PENDING, BatchStatistics.PUBLISH]
      }
    },
    Boolean(selectedBatchId)
  )

  const { approveTransactions } = useApproveTransactionsModel()

  const { reprocessTransactions } = useReprocessBatchModel()

  const { isSnackbarVisible, showSnackbar, handleClose, setSnackbarActionType } = useSnackbar()

  const { handleDrawerClose, isFiltersDrawerOpen } = useLayoutAuthContext()

  const { count, filters, quickFilters, handleClearFilters, areFiltersSubmitted, isApplyDisabled, isClearDisabled } = useBatchDetails()

  const handleApproveTransactions = () => {
    setSnackbarActionType(SnackbarActionType.APPROVE)

    return approveTransactions(
      {
        organisationId: selectedOrganisation,
        transactionIds: selectedTransactions ? [...selectedTransactions] : []
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['BATCH'] })
          setSelectedTransactions(undefined)
          showSnackbar()
        }
      }
    )
  }

  const handleReprocessTransactions = () => {
    return reprocessTransactions(
      { batchId: selectedBatchId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['BATCH'] })
          setIsReprocessing(true)
          setMessage(t({ id: 'transactionsReprocessing' }))
          setHint(t({ id: 'loadingHint' }))
          showSnackbarReprocess()
        }
      }
    )
  }

  const onClickButtonBack = () => {
    redirect
      ? navigate(redirect)
      : (() => {
          setSelectedBatchId('')
          setSelectedBatchStat(undefined)
        })()
  }

  const transactionsCount = batch ? batch.batchStatistics.total - batch.batchStatistics.published : null

  useEffect(() => {
    if (isFiltersDrawerOpen) {
      handleDrawerClose()
    }

    handleClearFilters()
  }, [selectedBatchStat])

  if (!selectedBatchId) {
    return (
      <>
        <LayoutAuth.Header>
          <LayoutAuth.Header.Details description={t({ id: 'reviewDescription' })} title={t({ id: 'reviewViewTitle' })} />
        </LayoutAuth.Header>
        <LayoutAuth.Main flexDirection="column" gap={6} isHeightRestricted>
          <SectionBatchesReview />
        </LayoutAuth.Main>
      </>
    )
  }

  // TODO: move this part to a separate view components independantly
  // for each status: Ready to approve, Invalid, Pending and Approved
  return (
    <BatchDetailsContextProvider value={{ count, filters: filters.values, quickFilters: quickFilters.values, areFiltersSubmitted }}>
      <LayoutAuth.Header>
        <LayoutAuth.Header.ButtonBack onClick={onClickButtonBack} />
        <LayoutAuth.Header.Details
          title={
            <Tooltip title={selectedBatchId} placement="right" arrow={false}>
              <Typography variant="h1" width="fit-content">{`${selectedBatchId.slice(0, 4)}...${selectedBatchId.slice(-4)}`}</Typography>
            </Tooltip>
          }
        >
          {batch && (
            <ChipGroup>
              <ChipImportDetails date={batch.createdAt} user={batch.createdBy || t({ id: 'system' })} />
              {transactionsCount && <ChipTransactionsCount count={transactionsCount} />}
            </ChipGroup>
          )}
        </LayoutAuth.Header.Details>
        {selectedBatchStat === BatchStatistics.APPROVE && (
          <ModalAction
            aria-label={t({ id: 'modalActionApproveMultipleTitle' })}
            message={t({ id: 'modalActionApproveMultipleMessage' })}
            primaryActionLabel={t({ id: 'confirm' })}
            secondaryActionLabel={t({ id: 'cancel' })}
            primaryActionOnClick={handleApproveTransactions}
            isModalDisabled={!selectedTransactions || selectedTransactions.length === 0}
            renderButton={({ handleClickOpen, isModalDisabled }) => (
              <ButtonPrimary onClick={handleClickOpen} disabled={isModalDisabled || !hasPermission('transactions', 'review_approve')}>
                {t({ id: 'approve' })}
              </ButtonPrimary>
            )}
          />
        )}
        {selectedBatchStat === BatchStatistics.PENDING && (
          <ButtonPrimary onClick={handleReprocessTransactions} disabled={!hasPermission('transactions', 'batches_reprocess') || isReprocessing}>
            {t({ id: 'reprocessAll' })}
          </ButtonPrimary>
        )}
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={3} isHeightRestricted>
        <FormikProvider value={quickFilters}>
          <TabsBatchesReview batch={batch} key={selectedBatchId} />
        </FormikProvider>
        {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
        <Snackbar open={isSnackbarVisible} onClose={handleClose} message={t({ id: 'transactionsApproved' })} />
      </LayoutAuth.Main>
      <LayoutAuth.Drawer open={isFiltersDrawerOpen}>
        <LayoutAuth.Drawer.Header title={t({ id: 'filters' })} onClose={handleDrawerClose} />
        <LayoutAuth.Drawer.Content>
          <FormikProvider value={filters}>
            <BatchDetailsFilters />
          </FormikProvider>
        </LayoutAuth.Drawer.Content>
        <LayoutAuth.Drawer.Footer>
          <Grid container size="grow" spacing={2}>
            <Grid size="grow">
              <ButtonSecondary type="button" onClick={handleClearFilters} disabled={isClearDisabled} fullWidth>
                {t({ id: 'clearAll' })}
              </ButtonSecondary>
            </Grid>
            <Grid size="grow">
              <ButtonPrimary form="batch-details-filters" type="submit" disabled={isApplyDisabled} fullWidth>
                {t({ id: 'applyFilters' })}
              </ButtonPrimary>
            </Grid>
          </Grid>
        </LayoutAuth.Drawer.Footer>
      </LayoutAuth.Drawer>
    </BatchDetailsContextProvider>
  )
}
