import {
  DISPLAY_NAME_TOO_LONG_MESSAGE,
  EMAIL_INVALID_MESSAGE,
  LABEL_TOO_LONG_MESSAGE,
  ORGANISATION_ID_TOO_LONG_MESSAGE
} from 'modules/card-issuance/constants/issuance.consts'

/**
 * The fields the operator fills in. Cards are always EXTERNAL with a machine-minted subjectId, so
 * neither appears here — and the public key is derived from the passkey, never typed. That leaves only
 * optional descriptive fields, so an empty form is valid.
 */
export type IssueCardFields = {
  displayName: string
  email: string
  organisationId: string
  label: string
}

export type IssueCardFieldErrors = Partial<Record<keyof IssueCardFields, string>>

// Length caps taken verbatim from the backend's CardIssuanceService (varchar columns / hand-rolled checks).
const MAX_DISPLAY_NAME = 255
const MAX_EMAIL = 320
const MAX_ORGANISATION_ID = 64
const MAX_LABEL = 255

/**
 * Mirrors the backend's hand-rolled email shape check: exactly one '@', neither the first nor the last
 * character, and no longer than 320 chars. Deliberately NOT a full RFC validator — it must accept and
 * reject exactly what the backend does so a client-valid email is never rejected server-side.
 */
export const isValidEmail = (email: string): boolean => {
  const at = email.indexOf('@')
  return at > 0 && at === email.lastIndexOf('@') && at < email.length - 1 && email.length <= MAX_EMAIL
}

/**
 * Validate the operator-entered fields against the backend's card rules. Returns a message per invalid
 * field (absent when valid). Card creation is fully client-side, so this is the ONLY validation there
 * is. Every field is optional and only validated when non-blank.
 */
export const validateFields = (fields: IssueCardFields): IssueCardFieldErrors => {
  const errors: IssueCardFieldErrors = {}

  // Optional fields are blank-checked BEFORE their length check, exactly as the backend does: a
  // whitespace-only value is treated as absent (and omitted from the card), never as "too long".
  if (fields.displayName.trim() && fields.displayName.length > MAX_DISPLAY_NAME) errors.displayName = DISPLAY_NAME_TOO_LONG_MESSAGE
  if (fields.email.trim() && !isValidEmail(fields.email)) errors.email = EMAIL_INVALID_MESSAGE
  if (fields.organisationId.trim() && fields.organisationId.length > MAX_ORGANISATION_ID) errors.organisationId = ORGANISATION_ID_TOO_LONG_MESSAGE
  if (fields.label.trim() && fields.label.length > MAX_LABEL) errors.label = LABEL_TOO_LONG_MESSAGE

  return errors
}
