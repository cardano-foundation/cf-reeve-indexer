import Box from '@mui/material/Box'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { DialogVatCode } from 'modules/vat-codes/components/DialogVatCode/DialogVatCode.component.tsx'
import { TableVatCodes } from 'modules/vat-codes/components/TableVatCodes/TableVatCodes.component.tsx'
import { useVatCodes } from 'modules/vat-codes/hooks/useVatCodes.ts'

export const ViewVatCodes = () => {
  const { t } = useTranslations()

  const {
    snackbar,
    vatCode,
    vatCodes,
    handleSnackbarClose,
    handleVatCodeDialogClose,
    handleVatCodeDialogConfirm,
    handleVatCodeDialogOpen,
    handleVatCodeEdit,
    hasVatCodes,
    isFetching,
    isSnackbarVisible,
    isVatCodeDialogOpen
  } = useVatCodes()

  return (
    <>
      <LayoutAuth.Header alignItems="center" justifyContent="space-between">
        <LayoutAuth.Header.Details title={t({ id: 'vatCodesViewTitle' })} />
        {hasVatCodes && !isFetching && (
          <Box alignItems="center" display="flex" gap={1}>
            <ButtonPrimary onClick={handleVatCodeDialogOpen} disabled={!hasPermission('vat_codes', 'create')}>
              {t({ id: 'add' })}
            </ButtonPrimary>
          </Box>
        )}
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={3} isHeightRestricted>
        <TableVatCodes data={vatCodes} onVatCodeDialogOpen={handleVatCodeDialogOpen} onVatCodeEdit={handleVatCodeEdit} isFetching={isFetching} />
      </LayoutAuth.Main>
      <DialogVatCode vatCode={vatCode} vatCodes={vatCodes} onCancel={handleVatCodeDialogClose} onConfirm={handleVatCodeDialogConfirm} open={isVatCodeDialogOpen} />
      {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
      <Snackbar hint={snackbar.hint} message={snackbar.message} type={snackbar.type} open={isSnackbarVisible} onClose={handleSnackbarClose} />
    </>
  )
}
