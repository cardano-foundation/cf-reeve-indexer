import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { useTransactions } from 'modules/transactions/hooks/useTransactions.ts'
import { SectionBatches } from 'modules/transactions/sections/SectionBatches/SectionBatches.component.tsx'
import { TransactionsCardsMenu } from 'modules/transactions/sections/TransactionsCardsMenu/TransactionsCardsMenu.component.tsx'

export const ViewTransactions = () => {
  const { t } = useTranslations()

  const { snackbar, handleSnackbarClose, isSnackbarVisible } = useTransactions()

  const showBatches = hasPermission('transactions', 'batches_view')

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'transactionsDescription' })} title={t({ id: 'transactionsViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6}>
        <TransactionsCardsMenu />
        {showBatches && <SectionBatches />}
      </LayoutAuth.Main>
      {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
      <Snackbar hint={snackbar.hint} message={snackbar.message} type={snackbar.type} onClose={handleSnackbarClose} open={isSnackbarVisible} />
    </>
  )
}
