import { TransactionItemApiResponse, Violation, ViolationSource } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { intl } from 'libs/translations/utils/intl.ts'

export const getItemsRejections = (items: TransactionItemApiResponse[]) =>
  items.reduce<Set<string>>((acc, { rejectionReason }) => {
    if (rejectionReason) {
      acc.add(intl.formatMessage({ id: rejectionReason }))
    }

    return acc
  }, new Set<string>())

export const getTransactionViolationsBySource = (groupedViolations: Record<string, Violation[]>, violationSource: ViolationSource) =>
  Object.values(groupedViolations).reduce<Set<string>>((acc, violations) => {
    violations.forEach(({ code, source }) => {
      if (source === violationSource) {
        acc.add(intl.formatMessage({ id: code }))
      }
    })

    return acc
  }, new Set<string>())

export const getItemViolationsBySource = (violations: Record<string, Violation[]>, id: string, violationSource: ViolationSource): string =>
  Array.from(
    violations[id]?.reduce((acc, { code, source }) => {
      if (source === violationSource) {
        acc.add(intl.formatMessage({ id: code }))
      }

      return acc
    }, new Set<string>()) ?? []
  ).join('\n')
