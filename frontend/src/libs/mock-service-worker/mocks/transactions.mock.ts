import {
  BatchStatistics,
  Status,
  TransactionApiResponse,
  TransactionType,
  ValidationStatus,
  ViolationCode,
  ViolationSeverity,
  ViolationSource
} from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'

export const TRANSACTIONS_MOCK: TransactionApiResponse[] = [
  {
    id: '1',
    internalTransactionNumber: 'TXN001',
    itemRejection: false,
    entryDate: new Date().toISOString(),
    transactionType: TransactionType.CARD_CHARGE,
    validationStatus: ValidationStatus.VALIDATED,
    transactionApproved: true,
    ledgerDispatchApproved: true,
    amountTotalLcy: 100,
    status: Status.OK,
    statistic: BatchStatistics.APPROVE,
    items: [],
    violations: []
  },
  {
    id: '2',
    internalTransactionNumber: 'TXN002',
    itemRejection: false,
    entryDate: new Date().toISOString(),
    transactionType: TransactionType.VENDOR_BILL,
    validationStatus: ValidationStatus.FAILED,
    transactionApproved: false,
    ledgerDispatchApproved: false,
    amountTotalLcy: 200,
    status: Status.OK,
    statistic: BatchStatistics.PENDING,
    items: [],
    violations: [
      {
        bag: {},
        code: ViolationCode.DOCUMENT_MUST_BE_PRESENT,
        severity: ViolationSeverity.ERROR,
        source: ViolationSource.LOB,
        transactionItemId: ''
      }
    ]
  },
  {
    id: '3',
    internalTransactionNumber: 'TXN003',
    itemRejection: false,
    entryDate: new Date().toISOString(),
    transactionType: TransactionType.CARD_REFUND,
    validationStatus: ValidationStatus.VALIDATED,
    transactionApproved: true,
    ledgerDispatchApproved: true,
    amountTotalLcy: 150,
    status: Status.OK,
    statistic: BatchStatistics.APPROVE,
    items: [],
    violations: []
  },
  {
    id: '4',
    internalTransactionNumber: 'TXN004',
    itemRejection: false,
    entryDate: new Date().toISOString(),
    transactionType: TransactionType.CUSTOMER_PAYMENT,
    validationStatus: ValidationStatus.VALIDATED,
    transactionApproved: true,
    ledgerDispatchApproved: true,
    amountTotalLcy: 300,
    status: Status.OK,
    statistic: BatchStatistics.PUBLISH,
    items: [],
    violations: []
  },
  {
    id: '5',
    internalTransactionNumber: 'TXN005',
    itemRejection: false,
    entryDate: new Date().toISOString(),
    transactionType: TransactionType.VENDOR_PAYMENT,
    validationStatus: ValidationStatus.VALIDATED,
    transactionApproved: true,
    ledgerDispatchApproved: true,
    amountTotalLcy: 225,
    status: Status.OK,
    statistic: BatchStatistics.INVALID,
    items: [],
    violations: [
      {
        bag: {},
        code: ViolationCode.DOCUMENT_MUST_BE_PRESENT,
        severity: ViolationSeverity.ERROR,
        source: ViolationSource.ERP,
        transactionItemId: ''
      }
    ]
  }
]
