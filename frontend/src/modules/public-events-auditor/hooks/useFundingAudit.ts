import { useGetEventAuditModel } from 'libs/models/events-model/GetEventAudit/GetEventAuditModel.service.ts'

/**
 * Loads the auditor roll-up for a single organisation, optionally scoped to a reporting period. The
 * query is disabled until an organisation is selected, mirroring the other public views which key off
 * the layout's organisation selector. The date range (ISO yyyy-MM-dd) filters dated spending events;
 * undated funding/refund events are always included by the backend.
 */
export const useFundingAudit = (organisationId: string, dateFrom?: string, dateTo?: string, projectIds: string[] = []) => {
  const isEnabled = Boolean(organisationId)

  const { audit, isAuditFetching } = useGetEventAuditModel(
    { parameters: { organisationId, dateFrom, dateTo, projectIds } },
    [organisationId, dateFrom ?? '', dateTo ?? '', projectIds.join(',')],
    isEnabled
  )

  return {
    audit,
    isFetching: isAuditFetching,
    hasOrganisation: isEnabled
  }
}
