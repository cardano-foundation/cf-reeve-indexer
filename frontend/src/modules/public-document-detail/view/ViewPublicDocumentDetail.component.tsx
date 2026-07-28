import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useGetDocumentDetailModel } from 'libs/models/documents-model/GetDocumentDetail/GetDocumentDetail.service.ts'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { AnchorCard } from 'modules/public-document-detail/components/AnchorCard/AnchorCard.component'
import { DecryptPanel } from 'modules/public-document-detail/components/DecryptPanel/DecryptPanel.component'
import {
  DOCUMENT_DETAIL_BACK_LABEL,
  DOCUMENT_DETAIL_CHOOSE_ANCHOR_PROMPT,
  DOCUMENT_DETAIL_ERROR_MESSAGE,
  DOCUMENT_DETAIL_NOT_FOUND_MESSAGE,
  DOCUMENT_DETAIL_PAGE_DESCRIPTION,
  DOCUMENT_DETAIL_PAGE_TITLE,
  DUPLICATE_ANCHORS_WARNING
} from 'modules/public-document-detail/constants/detail.consts.ts'
import { PATHS } from 'routes'

/**
 * A document, its on-chain anchors, and the in-browser decrypt panel. Nothing on this path requires
 * a login: it is where an external auditor lands to verify a published document independently, and
 * to decrypt it if they hold a recipient key.
 */
export const ViewPublicDocumentDetail = () => {
  const { organisationId, documentId } = useParams<{ organisationId: string; documentId: string }>()
  const { detail, isFetching, isError } = useGetDocumentDetailModel(documentId)

  // Deterministic destination: this page is reachable by deep link or refresh, where there is no
  // in-app history to go back to, so the back action always targets the list it belongs to.
  const documentsListPath = organisationId ? `/documents/${organisationId}` : PATHS.PUBLIC_DOCUMENTS

  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null)

  useEffect(() => {
    if (detail && !detail.duplicate_anchors && detail.anchors.length === 1) {
      setSelectedTxHash(detail.anchors[0].tx_hash)
    } else {
      setSelectedTxHash(null)
    }
  }, [detail])

  const anchors = detail?.anchors ?? []
  const selectedAnchor = anchors.find((anchor) => anchor.tx_hash === selectedTxHash) ?? null

  return (
    <>
      <LayoutPublic.Header>
        <Box alignItems="center" display="flex" gap={1}>
          <LayoutPublic.Header.ButtonBack aria-label={DOCUMENT_DETAIL_BACK_LABEL} to={documentsListPath} />
          <LayoutPublic.Header.Details description={DOCUMENT_DETAIL_PAGE_DESCRIPTION} title={DOCUMENT_DETAIL_PAGE_TITLE} />
        </Box>
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={3} isHeightRestricted>
        <Box sx={{ height: 3 }}>{isFetching && <LinearProgress />}</Box>

        {isError && <Alert severity="error">{DOCUMENT_DETAIL_ERROR_MESSAGE}</Alert>}

        {!isFetching && !isError && detail && anchors.length === 0 && <Alert severity="warning">{DOCUMENT_DETAIL_NOT_FOUND_MESSAGE}</Alert>}

        {detail && detail.duplicate_anchors && <Alert severity="warning">{DUPLICATE_ANCHORS_WARNING}</Alert>}

        {anchors.map((anchor) => (
          <AnchorCard
            key={anchor.tx_hash}
            anchor={anchor}
            isDuplicate={detail?.duplicate_anchors ?? false}
            isSelected={selectedAnchor?.tx_hash === anchor.tx_hash}
            onSelect={() => setSelectedTxHash(anchor.tx_hash)}
          />
        ))}

        {detail && anchors.length > 0 && (
          <Box sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2 }}>
            {selectedAnchor ? (
              <DecryptPanel anchor={selectedAnchor} documentId={detail.document_id} />
            ) : (
              <Alert severity="info">{DOCUMENT_DETAIL_CHOOSE_ANCHOR_PROMPT}</Alert>
            )}
          </Box>
        )}
      </LayoutPublic.Main>
    </>
  )
}
