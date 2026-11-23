import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { Modal } from 'features/common'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

import type { ModalTransactionTypesProps } from './ModalTransactionTypes.types'

export const ModalTransactionTypes = ({ isOpen, onClose }: ModalTransactionTypesProps) => {
  const { t } = useTranslations()

  const types = [
    ['VendorBill', t({ id: 'publicTransactionsTypeVendorBill' })],
    ['BillCredit', t({ id: 'publicTransactionsTypeBillCredit' })],
    ['VendorPayment', t({ id: 'publicTransactionsTypeVendorPayment' })],
    ['CustomerInvoice', t({ id: 'publicTransactionsTypeCustomerInvoice' })],
    ['CustomerPayment', t({ id: 'publicTransactionsTypeCustomerPayment' })],
    ['CardCharge', t({ id: 'publicTransactionsTypeCardCharge' })],
    ['CardRefund', t({ id: 'publicTransactionsTypeCardRefund' })],
    ['ExpenseReport', t({ id: 'publicTransactionsTypeExpenseReport' })],
    ['Transfer', t({ id: 'publicTransactionsTypeTransfer' })],
    ['Journal', t({ id: 'publicTransactionsTypeJournal' })],
    ['FxRevaluation', t({ id: 'publicTransactionsTypeFxRevaluation' })]
  ]

  return (
    <Modal aria-labelledby="transaction-types-title" onClose={onClose} isOpen={isOpen}>
      <Modal.Header id="transaction-types-title" hasCloseButton>
        {t({ id: 'publicTransactionsTypesModalTitle' })}
      </Modal.Header>
      <Modal.Content>
        <Box component="dl" display="flex" flexDirection="column" gap={1.5} m={0}>
          {types.map(([type, description]) => (
            <Box key={type}>
              <Typography component="dt" variant="body2" fontWeight={600}>
                {type}
              </Typography>
              <Typography component="dd" variant="body2" color="text.secondary" m={0}>
                {description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Modal.Content>
    </Modal>
  )
}
