export { pickMessages } from "@nivo/i18n/messages"

/**
 * The top-level catalogue namespaces the browser reads.
 *
 * `metadata` is read on the server only (page metadata), so it never travels; the landing sections,
 * the theme toggle and the error boundaries are the client readers.
 */
export const CLIENT_NAMESPACES = ["landing", "theme", "boundary"] as const
