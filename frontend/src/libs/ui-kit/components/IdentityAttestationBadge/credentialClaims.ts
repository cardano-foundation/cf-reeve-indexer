/**
 * Turns a credential's raw attribute block into rows a person can read.
 *
 * <p>Claims arrive as whatever the schema happens to define — the backends treat the block as opaque
 * and deliberately do not validate its shape, so this layer cannot assume any particular key exists.
 * Hence the design: a table of KNOWN keys giving a proper label, a display order and a hint about
 * formatting, plus a humanising fallback that renders anything unknown rather than dropping it.
 *
 * <p>That is what makes it adjustable per credential type. A Foundation Employee's name and role get
 * real labels in a sensible order; a vLEI's LEI gets monospace; a schema nobody has taught this file
 * about still renders every claim it carries, just with a derived label. Teaching it a new schema is
 * an entry in {@link KNOWN_CLAIMS} — never a change at the call sites.
 */

/** One rendered claim: a label, a printable value, and whether it wants a monospace face. */
export interface ClaimRow {
  key: string
  label: string
  value: string
  /** Identifiers (AIDs, SAIDs, LEIs) are unreadable in a proportional face and easy to misread. */
  mono: boolean
}

interface KnownClaim {
  label: string
  mono?: boolean
  /** Lower sorts first. Unknown keys land after every known one, in their original order. */
  order: number
}

/**
 * Keys this application knows how to present, lower-cased for lookup.
 *
 * <p>Ordered so identity comes before role and both come before anything administrative — the order a
 * person reads a credential in, not the order the issuer happened to serialise it.
 */
const KNOWN_CLAIMS: Record<string, KnownClaim> = {
  // --- who ---
  personlegalname: { label: 'Name', order: 10 },
  fullname: { label: 'Name', order: 10 },
  name: { label: 'Name', order: 10 },
  firstname: { label: 'First name', order: 11 },
  lastname: { label: 'Last name', order: 12 },
  familyname: { label: 'Last name', order: 12 },
  givenname: { label: 'First name', order: 11 },
  email: { label: 'Email', order: 20 },

  // --- what they are ---
  engagementcontextrole: { label: 'Role', order: 30 },
  officialrole: { label: 'Official role', order: 31 },
  role: { label: 'Role', order: 30 },
  title: { label: 'Title', order: 32 },
  department: { label: 'Department', order: 33 },
  employeeid: { label: 'Employee ID', order: 34, mono: true },

  // --- the organisation ---
  lei: { label: 'LEI', order: 40, mono: true },
  legalname: { label: 'Legal entity', order: 41 },
  organisation: { label: 'Organisation', order: 42 },
  organization: { label: 'Organisation', order: 42 },

  // --- the ACDC's own attribute-block datetime. The backends strip only the structural d/i/u, so
  //     this arrives as a claim; left visible because "when was this issued" is genuinely useful,
  //     but labelled and sorted late so it never leads. ---
  dt: { label: 'Issued on', order: 80 },

  // --- provenance-ish values that are identifiers ---
  issuer: { label: 'Issuer', order: 90, mono: true },
  registry: { label: 'Registry', order: 91, mono: true }
}

/** Anything that looks like a KERI identifier or a base64-ish digest reads better monospaced. */
const IDENTIFIER_LIKE = /^[A-Za-z0-9_-]{22,}$/

/** `engagementContextRole` / `engagement_context_role` -> `Engagement context role`. */
const humanizeKey = (key: string): string => {
  const spaced = key.replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  const trimmed = spaced.trim()
  if (trimmed.length === 0) return key

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

/**
 * Objects and arrays are stringified rather than skipped: a nested claim is still information, and an
 * omitted row would read as "this credential says nothing about that", which is a different statement.
 */
const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)

  return String(value)
}

/**
 * @param claims the credential's attribute block, already stripped of its structural keys by the
 *               backend. Null/undefined/empty all yield an empty array.
 * @returns rows in display order — known claims first by their configured order, then the rest in the
 *          order the credential listed them.
 */
export const describeClaims = (claims?: Record<string, unknown> | null): ClaimRow[] => {
  if (!claims) return []

  return Object.entries(claims)
    .map(([key, value], index) => {
      const known = KNOWN_CLAIMS[key.toLowerCase()]
      const formatted = formatValue(value)

      return {
        key,
        label: known?.label ?? humanizeKey(key),
        value: formatted,
        mono: known?.mono ?? IDENTIFIER_LIKE.test(formatted),
        // Unknown keys keep their original relative order, after every known one.
        sort: known ? known.order : 1000 + index
      }
    })
    .sort((left, right) => left.sort - right.sort)
    .map(({ key, label, value, mono }) => ({ key, label, value, mono }))
}
