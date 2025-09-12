import { User, UserRole } from '../authentication/types/user.types'

export type Permissions = {
  transactions: {
    dataType: null
    action:
      | 'view'
      | 'import_view'
      | 'import'
      | 'review_view'
      | 'review_approve'
      | 'review_reject'
      | 'publish_view'
      | 'publish_approve'
      | 'publish_reject'
      | 'batches_view'
      | 'batches_reprocess'
      | 'reconcilate_view'
      | 'reconcilate'
  }
  reports: {
    dataType: null
    action: 'view' | 'create' | 'edit' | 'preview' | 'publish' | 'publish_view'
  }
  data_explorer: {
    dataType: null
    action: 'view' | 'dashboard_view' | 'dashboard_create' | 'dashboard_edit' | 'extraction_view'
  }
  settings: {
    dataType: null
    action: 'view' | 'create' | 'edit'
  }
  organization: {
    dataType: null
    action: 'view'
  }
  organization_details: {
    dataType: null
    action: 'view' | 'create' | 'edit'
  }
  organization_setup: {
    dataType: null
    action: 'view' | 'import'
  }
  chart_of_accounts: {
    dataType: null
    action: 'view' | 'create' | 'edit'
  }
  event_codes: {
    dataType: null
    action: 'view' | 'create' | 'edit'
  }
  cost_centers: {
    dataType: null
    action: 'view' | 'create' | 'edit'
  }
  vat_codes: {
    dataType: null
    action: 'view' | 'create' | 'edit'
  }
}

type PermissionCheck<Key extends keyof Permissions> = boolean | ((user: User, data: Permissions[Key]['dataType']) => boolean)

export type RolesWithPermissions = {
  [R in UserRole]: Partial<{
    [Key in keyof Permissions]: Partial<{
      [Action in Permissions[Key]['action']]: PermissionCheck<Key>
    }>
  }>
}
