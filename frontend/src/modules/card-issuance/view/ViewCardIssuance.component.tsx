import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'

import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useGetCardStatusModel } from 'libs/models/cards-model/GetCardStatus/GetCardStatus.service'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { IssueCardForm } from 'modules/card-issuance/components/IssueCardForm/IssueCardForm.component'
import { CARD_ISSUANCE_DISABLED_MESSAGE, CARD_ISSUANCE_PAGE_DESCRIPTION, CARD_ISSUANCE_PAGE_TITLE } from 'modules/card-issuance/constants/issuance.consts'

/**
 * Card creation view (§9.4) — PERMISSIONLESS and fully client-side. The keypair is derived from a
 * passkey IN THE BROWSER (`IssueCardForm`) and the UNSIGNED card (public parts only) is assembled and
 * downloaded locally: there is no login and no network call to create a card. `issuance_enabled ===
 * false` (a public, unauthenticated status flag) collapses the whole view to one message so a
 * deployment can still hide the feature. Not wrapped in ProtectedRoute — no organisation gate.
 */
export const ViewCardIssuance = () => {
  const { issuanceEnabled, isFetching: isStatusFetching } = useGetCardStatusModel()

  return (
    <>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={CARD_ISSUANCE_PAGE_DESCRIPTION} title={CARD_ISSUANCE_PAGE_TITLE} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={3} isHeightRestricted>
        <Box sx={{ height: 3 }}>{isStatusFetching && <LinearProgress />}</Box>

        {!isStatusFetching && !issuanceEnabled && <Alert severity="info">{CARD_ISSUANCE_DISABLED_MESSAGE}</Alert>}

        {!isStatusFetching && issuanceEnabled && <IssueCardForm />}
      </LayoutPublic.Main>
    </>
  )
}
