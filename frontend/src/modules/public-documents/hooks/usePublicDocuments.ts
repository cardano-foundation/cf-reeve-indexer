import { useState } from 'react'

import type { DocumentVerdict } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useGetDocumentsModel } from 'libs/models/documents-model/GetDocuments/GetDocuments.service.ts'
import { VERDICT_FILTER_ALL, VerdictFilterValue } from 'modules/public-documents/constants/documents.consts.ts'

/**
 * Server-driven state for the public documents list: org scope (from the layout context),
 * pagination and a verdict filter, wired straight into `useGetDocumentsModel`. Mirrors the shape
 * of `usePublicTransactions`, simplified — this view has no drawer/quick filters, just a single
 * verdict `Select` and a `TablePagination`.
 */
export const usePublicDocuments = () => {
  const { selectedOrganisation } = useLayoutPublicContext()

  const { page, rowsPerPage, handlePagination } = usePagination()

  const [verdict, setVerdictValue] = useState<VerdictFilterValue>(VERDICT_FILTER_ALL)

  const setVerdict = (value: VerdictFilterValue) => {
    handlePagination(0, rowsPerPage)
    setVerdictValue(value)
  }

  const { documents, isFetching, isError } = useGetDocumentsModel({
    orgId: selectedOrganisation || undefined,
    page,
    size: rowsPerPage,
    ...(verdict !== VERDICT_FILTER_ALL ? { verdict: verdict as DocumentVerdict } : {})
  })

  return {
    documents,
    isFetching,
    isError,
    page,
    rowsPerPage,
    onPaginationChange: handlePagination,
    verdict,
    onVerdictChange: setVerdict
  }
}
