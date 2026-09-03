/**
 * Deployment and account facts the console reads but does not decide.
 *
 * A component never reads `process.env` and never spells a currency code: both
 * are one decision with one home, so a new host suffix or a second billing
 * currency is one edit here rather than one edit per block.
 */

/** Host suffix appended to an expert-site slug when it holds no custom domain. */
export const ACADEMY_HOST_SUFFIX = process.env.NEXT_PUBLIC_ACADEMY_HOST_SUFFIX ?? ".nivo.vn"

/** ISO 4217 code every wallet, invoice and catalogue amount is billed in. */
export const BILLING_CURRENCY = "VND"
