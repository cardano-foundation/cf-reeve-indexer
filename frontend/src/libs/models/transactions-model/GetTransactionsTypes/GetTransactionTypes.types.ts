export interface TransactionTypeDTO {
  name: string
  value: string
}

export interface TransactionsTypesDTO extends Array<TransactionTypeDTO> {}
