import type { Messages } from "next-intl"

/** Return only the requested top-level catalog namespaces. */
export const pickMessages = (messages: Messages, namespaces: ReadonlyArray<string>): Messages => {
    const picked: Messages = {}
    for (const namespace of namespaces) {
        const namespaceMessages = messages[namespace]
        if (namespaceMessages !== undefined) picked[namespace] = namespaceMessages
    }
    return picked
}
