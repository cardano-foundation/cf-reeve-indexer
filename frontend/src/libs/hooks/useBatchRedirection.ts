import { noop } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useLocationState } from 'hooks'
import { BatchApiResponse, BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { useBatchPublishContext } from 'modules/publish/components/BatchPublishContext/hooks/useBatchPublishContext.tsx'
import { useBatchContext } from 'modules/review/components/BatchContext/hooks/useBatchContext.tsx'
import { PATHS } from 'routes'

const useBatchRedirectionContext = () => {
  const { setSelectedBatchId: setSelectedReviewBatchId, setSelectedBatchStat: setSelectedReviewBatchStat } = useBatchContext()

  const selectBatch = ({ batchId, batchStat }: { batchId: string; batchStat: BatchStatistics }) => {
    setSelectedReviewBatchId(batchId)
    setSelectedReviewBatchStat(batchStat)
  }

  return selectBatch
}

const useBatchPublishRedirectionContext = () => {
  const { setSelectedBatchId: setSelectedPublishBatchId, setSelectedBatchStat: setSelectedPublishBatchStat } = useBatchPublishContext()

  const selectBatch = ({ batchId, batchStat }: { batchId: string; batchStat: BatchStatistics }) => {
    setSelectedPublishBatchId(batchId)
    setSelectedPublishBatchStat(batchStat)
  }

  return selectBatch
}

interface BatchRedirectionState {
  batch: BatchApiResponse
  isReview?: boolean
  isPublish?: boolean
}

// NOTE: temporary solution to provide redirection logic since
// table implementation isn't context dependent
export const useBatchRedirection = (state: BatchRedirectionState) => {
  const { batch, isPublish, isReview } = state

  const { pathname } = useLocationState()

  const navigate = useNavigate()

  const selectBatch = useBatchRedirectionContext()

  const handleCardApproveClick = () => {
    batch.batchStatistics.approve !== 0
      ? isReview
        ? selectBatch({ batchId: batch.id, batchStat: BatchStatistics.APPROVE })
        : navigate(PATHS.TRANSACTIONS_REVIEW, { state: { batchId: batch.id, batchStat: BatchStatistics.APPROVE, redirect: pathname } })
      : noop
  }

  const handleCardPendingClick = () => {
    batch.batchStatistics.pending !== 0
      ? isReview
        ? selectBatch({ batchId: batch.id, batchStat: BatchStatistics.PENDING })
        : navigate(PATHS.TRANSACTIONS_REVIEW, { state: { batchId: batch.id, batchStat: BatchStatistics.PENDING, redirect: pathname } })
      : noop
  }

  const handleCardInvalidClick = () => {
    batch.batchStatistics.invalid !== 0
      ? isReview
        ? selectBatch({ batchId: batch.id, batchStat: BatchStatistics.INVALID })
        : navigate(PATHS.TRANSACTIONS_REVIEW, { state: { batchId: batch.id, batchStat: BatchStatistics.INVALID, redirect: pathname } })
      : noop
  }

  const handleCardPublishClick = () => {
    batch.batchStatistics.publish !== 0
      ? isReview || isPublish
        ? selectBatch({ batchId: batch.id, batchStat: BatchStatistics.PUBLISH })
        : navigate(!isReview ? PATHS.TRANSACTIONS_PUBLISH : PATHS.TRANSACTIONS_REVIEW, { state: { batchId: batch.id, batchStat: BatchStatistics.PUBLISH, redirect: pathname } })
      : noop
  }

  const handleCardPublishedClick = () => {
    batch.batchStatistics.published !== 0
      ? isPublish
        ? selectBatch({ batchId: batch.id, batchStat: BatchStatistics.PUBLISHED })
        : navigate(PATHS.TRANSACTIONS_PUBLISH, { state: { batchId: batch.id, batchStat: BatchStatistics.PUBLISHED, redirect: pathname } })
      : noop
  }

  return {
    handleCardApproveClick,
    handleCardPendingClick,
    handleCardInvalidClick,
    handleCardPublishClick,
    handleCardPublishedClick
  }
}

// NOTE: temporary solution to provide redirection logic since
// table implementation isn't context dependent
export const useBatchPublishRedirection = (state: BatchRedirectionState) => {
  const { batch, isPublish } = state

  const { pathname } = useLocationState()

  const navigate = useNavigate()

  const selectBatch = useBatchPublishRedirectionContext()

  const handleCardPublishClick = () => {
    batch.batchStatistics.publish !== 0
      ? isPublish
        ? selectBatch({ batchId: batch.id, batchStat: BatchStatistics.PUBLISH })
        : navigate(PATHS.TRANSACTIONS_PUBLISH, { state: { batchId: batch.id, batchStat: BatchStatistics.PUBLISH, redirect: pathname } })
      : noop
  }

  const handleCardPublishedClick = () => {
    batch.batchStatistics.published !== 0
      ? isPublish
        ? selectBatch({ batchId: batch.id, batchStat: BatchStatistics.PUBLISHED })
        : navigate(PATHS.TRANSACTIONS_PUBLISH, { state: { batchId: batch.id, batchStat: BatchStatistics.PUBLISHED, redirect: pathname } })
      : noop
  }

  return {
    handleCardPublishClick,
    handleCardPublishedClick
  }
}
