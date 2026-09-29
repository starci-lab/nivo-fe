import type { Messages } from "next-intl"

/** Return only the requested top-level catalog namespaces. */
export const pickMessages = (messages: Messages, namespaces: ReadonlyArray<string>): Messages =>
    Object.fromEntries(
        namespaces.filter((namespace) => namespace in messages).map((namespace) => [namespace, messages[namespace]]),
    ) as Messages
