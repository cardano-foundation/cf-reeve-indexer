export enum UserRole {
  ADMIN = 'reeve_admin',
  MANAGER = 'reeve_account_manager',
  AUDITOR = 'reeve_auditor',
  ACCOUNTANT = 'reeve_accountant'
}

export type User = { roles: UserRole[]; organisations: string[]; given_name?: string; selectedOrganisation: string }
