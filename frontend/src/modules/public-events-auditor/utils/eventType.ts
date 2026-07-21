import { colors } from 'libs/ui-kit/theme/colors.ts'

/** Accent colour per grant event type, matching the KPI header (funding=blue, spend=orange, refund=red). */
export const eventTypeColor = (type: string | null | undefined): string => {
  switch ((type ?? '').toUpperCase()) {
    case 'FUNDING':
      return colors.blue[600]
    case 'SPENDING':
      return colors.orange[500]
    case 'REFUND':
      return colors.red[400]
    default:
      return colors.neutral[500]
  }
}

/** Translation key for a grant event type's display label. */
export const eventTypeLabelId = (type: string | null | undefined): string => {
  switch ((type ?? '').toUpperCase()) {
    case 'FUNDING':
      return 'auditTypeFunding'
    case 'SPENDING':
      return 'auditTypeSpending'
    case 'REFUND':
      return 'auditTypeRefund'
    default:
      return 'auditTypeOther'
  }
}
