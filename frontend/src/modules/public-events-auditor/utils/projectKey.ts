import { ProjectAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'

export const projectKey = (project: ProjectAuditView, index: number) => project.projectKey ?? project.projectId ?? `project-${index}`
